-- Migration: User asset aggregates and pg_cron scheduling
-- Recompute fiat-valued snapshots of user asset holdings every night.

DO $$
BEGIN
  -- 1) Create user_asset_aggregates table if not exists.
  CREATE TABLE IF NOT EXISTS public.user_asset_aggregates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    asset_id uuid REFERENCES public.assets(id) ON DELETE SET NULL,
    asset_symbol text NOT NULL,
    total_balance numeric(24,8) NOT NULL DEFAULT 0,
    fiat_valuation_eur numeric(24,8) NOT NULL DEFAULT 0,
    captured_at timestamptz NOT NULL DEFAULT now()
  );

  -- 2) Indexes for performance.
  CREATE INDEX IF NOT EXISTS idx_user_asset_aggregates_user_id ON public.user_asset_aggregates(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_asset_aggregates_captured_at ON public.user_asset_aggregates(captured_at DESC);

  -- 3) Enable RLS.
  ALTER TABLE public.user_asset_aggregates ENABLE ROW LEVEL SECURITY;

  -- 4) RLS Policies.
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users view own aggregates' AND tablename = 'user_asset_aggregates') THEN
    CREATE POLICY "Users view own aggregates" ON public.user_asset_aggregates
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins view all aggregates' AND tablename = 'user_asset_aggregates') THEN
    CREATE POLICY "Admins view all aggregates" ON public.user_asset_aggregates
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.is_admin = true
        )
      );
  END IF;
END
$$;

-- 5) Function to recompute aggregates.
CREATE OR REPLACE FUNCTION public.recompute_user_aggregates()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer := 0;
BEGIN
  -- Insert current snapshots of balances with fiat valuation from asset_snapshots.
  INSERT INTO public.user_asset_aggregates (
    user_id,
    asset_id,
    asset_symbol,
    total_balance,
    fiat_valuation_eur,
    captured_at
  )
  SELECT
    b.user_id,
    b.asset_id,
    b.asset,
    b.balance,
    (b.balance * COALESCE(s.price_eur, 0)),
    now()
  FROM public.balances b
  LEFT JOIN public.asset_snapshots s ON s.asset = b.asset;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- 6) Schedule nightly recomputation via pg_cron.
-- Note: 'cron.schedule' returns the job_id.
SELECT cron.schedule(
  'recompute-user-aggregates-nightly',
  '0 0 * * *', -- Midnight every day
  'SELECT public.recompute_user_aggregates()'
);
