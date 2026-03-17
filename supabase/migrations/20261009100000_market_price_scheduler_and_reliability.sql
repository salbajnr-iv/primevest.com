-- Market data ingestion reliability: failure log, snapshot source timestamps, and cron scheduling.

CREATE TABLE IF NOT EXISTS public.market_data_ingest_failures (
  id bigserial PRIMARY KEY,
  source text NOT NULL,
  tier text NOT NULL CHECK (tier IN ('core', 'tail', 'all')),
  reason text NOT NULL,
  status_code integer,
  attempt_count integer NOT NULL DEFAULT 1 CHECK (attempt_count >= 1),
  details text,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_market_data_ingest_failures_occurred_at
  ON public.market_data_ingest_failures (occurred_at DESC);

ALTER TABLE public.market_data_ingest_failures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS market_data_ingest_failures_admin_read ON public.market_data_ingest_failures;
CREATE POLICY market_data_ingest_failures_admin_read
ON public.market_data_ingest_failures
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.is_admin = true
  )
);

DROP POLICY IF EXISTS market_data_ingest_failures_admin_manage ON public.market_data_ingest_failures;
CREATE POLICY market_data_ingest_failures_admin_manage
ON public.market_data_ingest_failures
FOR ALL TO authenticated
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
      COALESCE(mp.price, mp.last_price) AS price_value,
      mp.source,
      mp.status,
      COALESCE(mp.captured_at, mp.priced_at, mp.created_at) AS source_priced_at,
      mp.created_at
    FROM public.market_prices mp
    WHERE p_source IS NULL OR mp.source = p_source
    ORDER BY mp.asset, COALESCE(mp.captured_at, mp.priced_at, mp.created_at) DESC, mp.created_at DESC
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
      lp.price_value,
      lp.source,
      lp.status,
      lp.source_priced_at,
      now(),
      jsonb_build_object(
        'ingested_at', lp.created_at,
        'source_timestamp', lp.source_priced_at,
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

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
DECLARE
  v_project_url text;
  v_anon_key text;
BEGIN
  SELECT decrypted_secret INTO v_project_url
  FROM vault.decrypted_secrets
  WHERE name = 'project_url';

  SELECT decrypted_secret INTO v_anon_key
  FROM vault.decrypted_secrets
  WHERE name = 'anon_key';

  IF v_project_url IS NULL OR v_anon_key IS NULL THEN
    RAISE NOTICE 'Skipping market-price-ingest cron scheduling (missing vault secrets project_url/anon_key).';
    RETURN;
  END IF;

  BEGIN
    PERFORM cron.unschedule('market-price-ingest-core-30s');
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  BEGIN
    PERFORM cron.unschedule('market-price-ingest-tail-2m');
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  PERFORM cron.schedule(
    'market-price-ingest-core-30s',
    '30 seconds',
    format(
      $cron$
      select net.http_post(
        url := '%s/functions/v1/market-price-ingest?tier=core',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer %s'
        ),
        body := '{}'::jsonb
      ) as request_id;
      $cron$,
      v_project_url,
      v_anon_key
    )
  );

  PERFORM cron.schedule(
    'market-price-ingest-tail-2m',
    '*/2 * * * *',
    format(
      $cron$
      select net.http_post(
        url := '%s/functions/v1/market-price-ingest?tier=tail',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer %s'
        ),
        body := '{}'::jsonb
      ) as request_id;
      $cron$,
      v_project_url,
      v_anon_key
    )
  );
END $$;
