-- =====================================================
-- Market Price Ingestion Cron Job Setup
-- =====================================================
-- This script sets up automated hourly market price updates
-- using Supabase pg_cron extension.
--
-- The cron job will:
-- 1. Call the market-price-ingest Edge Function every hour
-- 2. Fetch real-time prices from CoinGecko API
-- 3. Update market_prices and asset_snapshots tables
-- =====================================================

-- Step 1: Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Step 2: Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Step 3: Schedule hourly market price ingestion
-- Runs at minute 0 of every hour (e.g., 1:00, 2:00, 3:00, etc.)
SELECT cron.schedule(
  'market-price-ingest-hourly',           -- Unique job name
  '0 * * * *',                            -- Cron schedule: Every hour at :00
  $$
  SELECT net.http_post(
    url := 'https://xhyivvvbrcmbjvzmvlod.supabase.co/functions/v1/market-price-ingest?tier=all',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    timeout_milliseconds := 60000         -- 60 second timeout
  )
  $$
);

-- Step 4: Schedule core assets update every 15 minutes
-- For faster updates on major cryptocurrencies (BTC, ETH, SOL, BNB, XRP)
SELECT cron.schedule(
  'market-price-ingest-core',             -- Unique job name
  '*/15 * * * *',                         -- Every 15 minutes
  $$
  SELECT net.http_post(
    url := 'https://xhyivvvbrcmbjvzmvlod.supabase.co/functions/v1/market-price-ingest?tier=core',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    timeout_milliseconds := 30000         -- 30 second timeout
  )
  $$
);

-- Step 5: Verify scheduled jobs
SELECT 
  jobname,
  minute,
  hour,
  day_of_month,
  month,
  day_of_week,
  command
FROM cron.job
WHERE jobname LIKE 'market-price-ingest%';

-- Step 6: Create view to monitor job execution history
CREATE OR REPLACE VIEW market_ingest_job_history AS
SELECT 
  j.jobname,
  r.runid,
  r.start_time,
  r.end_time,
  r.status,
  r.return_message,
  EXTRACT(EPOCH FROM (r.end_time - r.start_time)) as duration_seconds
FROM cron.job_run_details r
JOIN cron.job j ON r.jobid = j.jobid
WHERE j.jobname LIKE 'market-price-ingest%'
ORDER BY r.start_time DESC
LIMIT 100;

-- Grant permissions (optional - adjust as needed)
-- GRANT USAGE ON SCHEMA cron TO authenticated;
-- GRANT EXECUTE ON FUNCTION cron.schedule TO authenticated;

-- =====================================================
-- Usage Examples:
-- =====================================================

-- View scheduled jobs:
-- SELECT * FROM market_ingest_job_history;

-- Manually trigger a job (for testing):
-- SELECT cron.run_job('market-price-ingest-hourly');

-- Pause a job (without deleting):
-- SELECT cron.unschedule('market-price-ingest-hourly');

-- Resume a paused job:
-- SELECT cron.schedule('market-price-ingest-hourly', '0 * * * *', 'SELECT net.http_post(...)');

-- Delete a job permanently:
-- SELECT cron.unschedule('market-price-ingest-hourly');

-- =====================================================
-- Monitoring Queries:
-- =====================================================

-- Check last 10 job runs:
-- SELECT * FROM market_ingest_job_history LIMIT 10;

-- Check job success rate:
-- SELECT 
--   jobname,
--   COUNT(*) as total_runs,
--   COUNT(*) FILTER (WHERE status = 'succeeded') as successful_runs,
--   ROUND(COUNT(*) FILTER (WHERE status = 'succeeded') * 100.0 / COUNT(*), 2) as success_rate_pct
-- FROM market_ingest_job_history
-- GROUP BY jobname;

-- Check average execution time:
-- SELECT 
--   jobname,
--   ROUND(AVG(duration_seconds), 2) as avg_duration_seconds
-- FROM market_ingest_job_history
-- GROUP BY jobname;
