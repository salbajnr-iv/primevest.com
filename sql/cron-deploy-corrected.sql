-- =====================================================
-- Cron Job Deployment - CORRECTED VERSION
-- =====================================================
-- Run this ENTIRE script in Supabase Dashboard SQL Editor
-- All errors from previous runs have been fixed
-- =====================================================

-- Step 1: Enable extensions (already done - will skip)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Step 2: Schedule hourly market price ingestion (all assets)
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

-- Step 3: Schedule core assets update every 15 minutes
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

-- Step 4: Create monitoring view with CORRECT column names
DROP VIEW IF EXISTS market_ingest_job_history;

CREATE OR REPLACE VIEW market_ingest_job_history AS
SELECT 
  j.jobname,           -- FIXED: was schedule_name
  r.runid,
  r.start_time,
  r.end_time,
  r.status,
  r.return_message,
  EXTRACT(EPOCH FROM (r.end_time - r.start_time)) as duration_seconds
FROM cron.job_run_details r
JOIN cron.job j ON r.jobid = j.jobid
WHERE j.jobname LIKE 'market-price-ingest%'  -- FIXED: was schedule_name
ORDER BY r.start_time DESC
LIMIT 100;

-- Step 5: Verify everything is set up correctly
SELECT 
  jobname,
  schedule,
  command,
  active
FROM cron.job
WHERE jobname LIKE 'market-price-ingest%';

-- Done! You should see 2 jobs scheduled
