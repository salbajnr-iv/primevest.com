# 🚀 Cron Job Deployment - Quick Start

## ⚡ 2-Minute Deploy via Supabase Dashboard

### Step 1: Open SQL Editor

Click here: **https://supabase.com/dashboard/project/xhyivvvbrcmbjvzmvlod/sql/new**

### Step 2: Run These 4 Files (Copy-Paste-Run)

Open each file and copy-paste into the editor, then click **"Run"**:

#### File 1️⃣: Enable Extensions

```
📁 sql/cron-01-extensions.sql
```

**Content:**

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
```

---

#### File 2️⃣: Schedule Hourly Updates

```
📁 sql/cron-02-schedule-hourly.sql
```

**Content:**

```sql
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
```

---

#### File 3️⃣: Schedule Core Crypto Updates (15 min)

```
📁 sql/cron-03-schedule-core.sql
```

**Content:**

```sql
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
```

---

#### File 4️⃣: Create Monitoring View

```
📁 sql/cron-04-create-view.sql
```

**Content:**

```sql
-- Create monitoring view
CREATE OR REPLACE VIEW market_ingest_job_history AS
SELECT
  j.schedule_name,
  r.runid,
  r.start_time,
  r.end_time,
  r.status,
  r.return_message,
  EXTRACT(EPOCH FROM (r.end_time - r.start_time)) as duration_seconds
FROM cron.job_run_details r
JOIN cron.job j ON r.jobid = j.jobid
WHERE j.schedule_name LIKE 'market-price-ingest%'
ORDER BY r.start_time DESC
LIMIT 100;
```

---

### Step 3: Verify It Worked

Run this query in the SQL editor:

```sql
SELECT * FROM market_ingest_job_history;
```

You should see an empty table (no runs yet) or the first successful run.

---

### Step 4: Wait & Watch

- **Core crypto** (BTC, ETH, SOL, BNB, XRP): Updates every **15 minutes**
- **All assets** (50+ symbols): Updates every **hour**

Check back after 15-60 minutes to see successful runs!

---

## 📊 What Happens Next

```
Every 15 minutes ──► Function calls CoinGecko API
                      ↓
                   Gets REAL-TIME prices for BTC, ETH, SOL, BNB, XRP
                      ↓
                   Saves to database (market_prices + asset_snapshots)
                      ↓
                   Your dashboard shows LIVE data

Every hour ──► Same process for ALL 50+ symbols
```

---

## ✅ Success Checklist

After deployment:

- [ ] Extensions enabled (pg_cron, pg_net)
- [ ] Two jobs scheduled (check with `SELECT * FROM cron.job`)
- [ ] After 15-60 min: successful runs in history
- [ ] Fresh prices in your dashboard

---

## 🔗 Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/xhyivvvbrcmbjvzmvlod
- **Edge Functions**: https://supabase.com/dashboard/project/xhyivvvbrcmbjvzmvlod/functions
- **Database Logs**: https://supabase.com/dashboard/project/xhyivvvbrcmbjvzmvlod/database/logs

---

## 🆘 Need Help?

See full guide: **`DEPLOY_CRON_GUIDE.md`**

---

**That's it! Your automated market price updates are now live!** 🎉
