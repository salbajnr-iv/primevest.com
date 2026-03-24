-- Create monitoring view
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
