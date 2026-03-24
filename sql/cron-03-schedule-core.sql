-- Schedule core assets update every 15 minutes
SELECT cron.schedule(
  'market-price-ingest-core',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://xhyivvvbrcmbjvzmvlod.supabase.co/functions/v1/market-price-ingest?tier=core',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    timeout_milliseconds := 30000
  )
  $$
);
