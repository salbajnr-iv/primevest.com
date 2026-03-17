-- Market data source health monitor + realtime publication bindings.

CREATE TABLE IF NOT EXISTS public.market_data_source_health (
  source text PRIMARY KEY,
  status text NOT NULL CHECK (status IN ('healthy', 'degraded', 'down')),
  checked_at timestamptz NOT NULL DEFAULT now(),
  latency_ms integer NOT NULL DEFAULT 0 CHECK (latency_ms >= 0),
  failure_count integer NOT NULL DEFAULT 0 CHECK (failure_count >= 0),
  details text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_market_data_source_health_checked_at
  ON public.market_data_source_health (checked_at DESC);

CREATE OR REPLACE FUNCTION public.touch_market_data_source_health_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_market_data_source_health_updated_at ON public.market_data_source_health;
CREATE TRIGGER trg_market_data_source_health_updated_at
BEFORE UPDATE ON public.market_data_source_health
FOR EACH ROW
EXECUTE FUNCTION public.touch_market_data_source_health_updated_at();

ALTER TABLE public.market_data_source_health ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS market_data_source_health_read_authenticated ON public.market_data_source_health;
CREATE POLICY market_data_source_health_read_authenticated
ON public.market_data_source_health
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS market_data_source_health_admin_manage ON public.market_data_source_health;
CREATE POLICY market_data_source_health_admin_manage
ON public.market_data_source_health
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true
  )
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'market_prices'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.market_prices;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'support_tickets'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'support_ticket_replies'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.support_ticket_replies;
  END IF;
END $$;
