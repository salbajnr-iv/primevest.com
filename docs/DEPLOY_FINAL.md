# 🚀 FINAL Deployment Instructions - CORRECTED

## ✅ What's Fixed

The error `column "schedule_name" does not exist` has been fixed by changing to `jobname`.

---

## 🎯 ONE-CLICK DEPLOYMENT

### **Option 1: Run Complete Corrected Script** ⭐ RECOMMENDED

1. **Open**: https://supabase.com/dashboard/project/xhyivvvbrcmbjvzmvlod/sql/new

2. **Copy this entire file**: `sql/cron-deploy-corrected.sql`

3. **Paste and Run** in the SQL editor

4. **Expected Output:**
   ```
   NOTICE: extension "pg_cron" already exists, skipping
   NOTICE: extension "pg_net" already exists, skipping
   cron.schedule (job created)
   cron.schedule (job created)
   DROP VIEW
   CREATE VIEW
   jobname: market-price-ingest-hourly
   jobname: market-price-ingest-core
   ```

**Done!** ✅ Your cron jobs are now scheduled with correct monitoring.

---

### **Option 2: Manual Step-by-Step**

If you prefer to run each step separately:

#### **Step 1: Extensions** (Already done ✅)

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
```

_Result: Should show "already exists, skipping"_

---

#### **Step 2: Hourly Job**

```sql
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
```

_Result: "cron.schedule" - job created_

---

#### **Step 3: Core Job (15 min)**

```sql
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
```

_Result: "cron.schedule" - job created_

---

#### **Step 4: Fix Monitoring View**

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

_Result: "DROP VIEW" then "CREATE VIEW"_

---

#### **Step 5: Verify**

```sql
SELECT jobname, schedule, command, active
FROM cron.job
WHERE jobname LIKE 'market-price-ingest%';
```

**Expected Result:**

```
┌──────────────────────────────┬─────────────┬─────────────────────────┬────────┐
│ jobname                      │ schedule    │ command                 │ active │
├──────────────────────────────┼─────────────┼─────────────────────────┼────────┤
│ market-price-ingest-hourly   │ 0 * * * *   │ SELECT net.http_post... │ true   │
│ market-price-ingest-core     │ */15 * * *  │ SELECT net.http_post... │ true   │
└──────────────────────────────┴─────────────┴─────────────────────────┴────────┘
```

---

## ✅ Success Checklist

After deployment, verify:

- [ ] ✅ Extensions enabled (already done)
- [ ] ✅ Two jobs created (`market-price-ingest-hourly`, `market-price-ingest-core`)
- [ ] ✅ Jobs show correct schedules (`0 * * * *` and `*/15 * * * *`)
- [ ] ✅ Both jobs are `active = true`
- [ ] ✅ Monitoring view created successfully

---

## 📊 What Happens Next

### **Automatic Updates:**

```
Every 15 minutes ──► Core crypto (BTC, ETH, SOL, BNB, XRP)
                      ↓
                  CoinGecko API → Real-time prices
                      ↓
                  Database updated automatically

Every hour ──► All 50+ symbols
                      ↓
                  Full market data refresh
```

### **Wait & Monitor:**

1. **Wait 15 minutes** for first core job run
2. **Check history**: `SELECT * FROM market_ingest_job_history;`
3. **Look for**: `status = 'succeeded'`
4. **Verify**: Fresh data in your dashboard

---

## 🔧 Management Commands

### **View Current Jobs:**

```sql
SELECT jobname, schedule, active
FROM cron.job
WHERE jobname LIKE 'market-price-ingest%';
```

### **Check Execution History:**

```sql
SELECT * FROM market_ingest_job_history LIMIT 10;
```

### **Pause Jobs:**

```sql
SELECT cron.unschedule('market-price-ingest-hourly');
SELECT cron.unschedule('market-price-ingest-core');
```

### **Resume Jobs:**

Re-run the deployment script above.

---

## 🆘 Troubleshooting

### **"Job already exists" Error:**

If you see this, the jobs were already created. Just run:

```sql
-- Drop existing jobs
SELECT cron.unschedule('market-price-ingest-hourly');
SELECT cron.unschedule('market-price-ingest-core');

-- Then re-run the deployment script
```

### **View Not Created:**

```sql
-- Manually create it
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

---

## 🎉 You're Done!

Your automated market price updates are now live!

**Next Steps:**

1. Wait 15-60 minutes
2. Check `market_ingest_job_history` for successful runs
3. Verify fresh prices in your dashboard
4. Optional: Delete old `price.json` file

---

**Questions?** See [`CRON_COLUMN_FIX.md`](file:///c:/Users/DELL%207480/SALBA-JNR/htdocs/primevest.com/CRON_COLUMN_FIX.md) for detailed troubleshooting.

**Deploy Now**: Copy-paste `sql/cron-deploy-corrected.sql` into Supabase Dashboard! 🚀
