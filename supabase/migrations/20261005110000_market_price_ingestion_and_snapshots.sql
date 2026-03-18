-- Market data ingestion support: normalized snapshots + refresh RPC.

CREATE TABLE IF NOT EXISTS public.asset_snapshots (
  asset text PRIMARY KEY,
  asset_id uuid REFERENCES public.assets(id) ON DELETE SET NULL,
  price_eur numeric(24,8) NOT NULL CHECK (price_eur >= 0),
  source text NOT NULL,
  source_status public.price_status NOT NULL DEFAULT 'live',
  priced_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_asset_snapshots_priced_at ON public.asset_snapshots(priced_at DESC);

CREATE OR REPLACE FUNCTION public.refresh_asset_snapshots(p_source text DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_upserts integer := 0;
BEGIN
  WITH latest_prices AS (
    SELECT DISTINCT ON (mp.asset)
      mp.asset,
      mp.asset_id,
      mp.last_price,
      mp.source,
      mp.status,
      mp.priced_at,
      mp.created_at
    FROM public.market_prices mp
    WHERE p_source IS NULL OR mp.source = p_source
    ORDER BY mp.asset, mp.priced_at DESC, mp.created_at DESC
  ), upserted AS (
    INSERT INTO public.asset_snapshots (
      asset,
      asset_id,
      price_eur,
      source,
      source_status,
      priced_at,
      updated_at,
      metadata
    )
    SELECT
      lp.asset,
      lp.asset_id,
      lp.last_price,
      lp.source,
      lp.status,
      lp.priced_at,
      now(),
      jsonb_build_object(
        'ingested_at', lp.created_at,
        'refresh_source', coalesce(p_source, 'all')
      )
    FROM latest_prices lp
    ON CONFLICT (asset)
    DO UPDATE SET
      asset_id = EXCLUDED.asset_id,
      price_eur = EXCLUDED.price_eur,
      source = EXCLUDED.source,
      source_status = EXCLUDED.source_status,
      priced_at = EXCLUDED.priced_at,
      updated_at = now(),
      metadata = EXCLUDED.metadata
    RETURNING 1
  )
  SELECT count(*) INTO v_upserts FROM upserted;

  RETURN v_upserts;
END;
$$;

ALTER TABLE public.asset_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS asset_snapshots_read_all ON public.asset_snapshots;
CREATE POLICY asset_snapshots_read_all ON public.asset_snapshots
FOR SELECT
USING (true);

DROP POLICY IF EXISTS asset_snapshots_admin_manage ON public.asset_snapshots;
CREATE POLICY asset_snapshots_admin_manage ON public.asset_snapshots
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.is_admin = true
  )
);
