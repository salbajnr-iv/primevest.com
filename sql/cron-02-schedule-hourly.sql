-- Schedule hourly market price ingestion (all assets)
SELECT cron.schedule(
  'market-price-ingest-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://xhyivvvbrcmbjvzmvlod.supabase.co/functions/v1/market-price-ingest?tier=all',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    timeout_milliseconds := 60000
  )
  $$
);
