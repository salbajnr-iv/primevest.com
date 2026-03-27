# 🔧 Cron Job Column Fix Applied

## Issue Found & Fixed

**Problem:** The `cron.job` table uses `jobname` (not `schedule_name`) as the column name.

**Error You Encountered:**

```
column j.schedule_name does not exist
```

---

## ✅ Files Updated

I've fixed all SQL files to use the correct column name `jobname`:

### **Fixed Files:**

1. ✅ **sql/cron-04-create-view.sql** - Monitoring view now uses `j.jobname`
2. ✅ **sql/setup-market-price-cron.sql** - All queries updated to use `jobname`

### **What Changed:**

```diff
-- OLD (WRONG):
SELECT schedule_name FROM cron.job;
WHERE j.schedule_name LIKE 'market-price-ingest%';

-- NEW (CORRECT):
SELECT jobname FROM cron.job;
WHERE j.jobname LIKE 'market-price-ingest%';
```

---

## 📊 Correct pg_cron Schema

The `cron.job` table has these columns:

| Column     | Type    | Description                             |
| ---------- | ------- | --------------------------------------- |
| `jobid`    | bigint  | Primary key                             |
| `jobname`  | text    | **← Use this!** Name of the job         |
| `schedule` | text    | Cron expression (e.g., '0 \* \* \* \*') |
| `command`  | text    | SQL command to execute                  |
| `nodename` | text    | Node name                               |
| `nodeport` | integer | Node port                               |
| `database` | text    | Database name                           |
| `username` | text    | Username                                |
| `active`   | boolean | Whether job is active                   |
| `jobclass` | text    | Job class                               |

---

## ✅ Verification Query (Fixed)

Run this to check your scheduled jobs:

```sql
SELECT
  jobname,           -- ← Correct column name
  schedule,          -- Cron expression
  command,           -- What it executes
  active             -- Is it running?
FROM cron.job
WHERE jobname LIKE 'market-price-ingest%';
```

**Expected Output:**

```
│ jobname                   │ schedule  │ command                          │ active │
├───────────────────────────┼───────────┼──────────────────────────────────┼────────┤
│ market-price-ingest-hourly│ 0 * * * * │ SELECT net.http_post(...)        │ true   │
│ market-price-ingest-core  │ */15 * * *│ SELECT net.http_post(...)        │ true   │
```

---

## 📝 Updated Monitoring View

The `market_ingest_job_history` view now correctly uses:

```sql
CREATE OR REPLACE VIEW market_ingest_job_history AS
SELECT
  j.jobname,           -- ← Fixed!
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
```

---

## 🚀 Deploy Again

Since you already ran the files and hit the error, you have two options:

### **Option 1: Just Re-run File 4** ✅ EASIEST

Only the monitoring view needs to be re-created:

```sql
-- Drop old view
DROP VIEW IF EXISTS market_ingest_job_history;

-- Create new view with correct columns
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
```

### **Option 2: Verify Everything Works**

If the first 3 files ran successfully, your cron jobs ARE already scheduled! Just verify:

```sql
-- Check if jobs are scheduled (this should work now)
SELECT jobname, schedule, command, active
FROM cron.job
WHERE jobname LIKE 'market-price-ingest%';

-- Wait 15 minutes, then check history
SELECT * FROM market_ingest_job_history LIMIT 10;
```

---

## 🎯 Quick Test

Run these queries in order:

**1. Check Jobs Are Scheduled:**

```sql
SELECT jobname, schedule FROM cron.job;
```

**Should Show:**

- `market-price-ingest-hourly` with schedule `0 * * * *`
- `market-price-ingest-core` with schedule `*/15 * * * *`

**2. Create/Recreate the View:**

```sql
DROP VIEW IF EXISTS market_ingest_job_history;

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
```

**3. Test the View:**

```sql
SELECT * FROM market_ingest_job_history;
```

---

## ✅ Summary

**Issue:** Wrong column name (`schedule_name` vs `jobname`)  
**Status:** ✅ FIXED in all SQL files  
**Action Needed:** Re-run file 4 or just the DROP/CREATE VIEW statement above

Your cron jobs are likely already working - only the monitoring view had the bug! 🎉

---

**Next Steps:** Run the verification query above and confirm your jobs are scheduled! 🚀
