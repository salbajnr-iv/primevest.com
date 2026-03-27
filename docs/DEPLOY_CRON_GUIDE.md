# 🚀 Deploy Cron Jobs - Quick Guide

## ✅ Files Created

I've created 4 SQL files for you to deploy the cron jobs:

1. **`sql/cron-01-extensions.sql`** - Enables pg_cron and pg_net extensions
2. **`sql/cron-02-schedule-hourly.sql`** - Schedules hourly updates for ALL assets
3. **`sql/cron-03-schedule-core.sql`** - Schedules 15-minute updates for core crypto (BTC, ETH, SOL, BNB, XRP)
4. **`sql/cron-04-create-view.sql`** - Creates monitoring view

---

## 🎯 TWO Easy Deployment Options

### **Option 1: Supabase Dashboard (EASIEST)** ⭐ RECOMMENDED

1. Go to: **https://supabase.com/dashboard/project/xhyivvvbrcmbjvzmvlod/sql/new**

2. **Copy and paste** each SQL file content into the editor (one at a time)

3. **Click "Run"** for each file in order:
   - First: `cron-01-extensions.sql`
   - Second: `cron-02-schedule-hourly.sql`
   - Third: `cron-03-schedule-core.sql`
   - Fourth: `cron-04-create-view.sql`

4. **Verify** by running:
   ```sql
   SELECT * FROM market_ingest_job_history;
   ```

---

### **Option 2: Using psql CLI**

If you have PostgreSQL installed locally:

```bash
# Set your connection string
export DATABASE_URL="postgresql://postgres.xhyivvvbrcmbjvzmvlod:[YOUR_PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres"

# Run each file
psql "$DATABASE_URL" -f sql/cron-01-extensions.sql
psql "$DATABASE_URL" -f sql/cron-02-schedule-hourly.sql
psql "$DATABASE_URL" -f sql/cron-03-schedule-core.sql
psql "$DATABASE_URL" -f sql/cron-04-create-view.sql
```

**Note:** Replace `[YOUR_PASSWORD]` with your actual database password from `.env` file.

---

## 📊 What Gets Deployed

### **Two Scheduled Jobs:**

| Job Name                     | Schedule          | What It Does                                    |
| ---------------------------- | ----------------- | ----------------------------------------------- |
| `market-price-ingest-hourly` | Every hour at :00 | Fetches prices for ALL 50+ symbols              |
| `market-price-ingest-core`   | Every 15 minutes  | Fetches prices for BTC, ETH, SOL, BNB, XRP only |

### **Monitoring View:**

`market_ingest_job_history` - Shows last 100 job runs with:

- Execution time
- Status (succeeded/failed)
- Duration
- Error messages

---

## ✅ Verification Steps

After deployment, verify it's working:

### **1. Check Scheduled Jobs**

```sql
SELECT
  schedule_name,
  minute,
  hour,
  command
FROM cron.job
WHERE schedule_name LIKE 'market-price-ingest%';
```

**Expected Output:**

```
│ schedule_name          │ minute │ hour │ command
│ market-price-ingest... │ 0      │ *    │ SELECT net.http_post(...)
│ market-price-ingest... │ */15   │ *    │ SELECT net.http_post(...)
```

### **2. Wait 15-60 Minutes**

The jobs will run automatically according to their schedules.

### **3. Check Execution History**

```sql
SELECT * FROM market_ingest_job_history LIMIT 10;
```

You should see successful job runs updating your market prices!

---

## 🔧 Management Commands

### **Pause a Job**

```sql
SELECT cron.unschedule('market-price-ingest-hourly');
```

### **Resume a Paused Job**

```sql
-- You'll need to reschedule with the same parameters
```

### **Delete a Job Permanently**

```sql
SELECT cron.unschedule('market-price-ingest-hourly');
SELECT cron.unschedule('market-price-ingest-core');
```

### **Manually Trigger (for testing)**

```sql
SELECT cron.run_job('market-price-ingest-hourly');
```

---

## 🎉 Success Indicators

✅ Extensions created successfully  
✅ Two jobs appear in `cron.job` table  
✅ Jobs show correct schedules (`0 * * * *` and `*/15 * * * *`)  
✅ After 15-60 minutes, `market_ingest_job_history` shows successful runs  
✅ Your `asset_snapshots` table has fresh data

---

## 🆘 Troubleshooting

**Error: "extension not available"**

- Supabase might need to enable pg_cron/pg_net first
- Contact Supabase support or check dashboard → Database → Extensions

**Error: "permission denied"**

- Make sure you're using the postgres role (not anon)
- Use the connection string from your `.env` file

**Jobs not running?**

- Check Supabase logs: Dashboard → Database → Logs
- Filter for "cron" or "pg_net"
- Verify your Edge Function URL is accessible

---

## 📱 Next Steps After Deployment

1. **Wait for first run** (15 minutes for core, 60 for all)
2. **Check the monitoring view**: `SELECT * FROM market_ingest_job_history;`
3. **Verify data updated**: Check your dashboard or query `asset_snapshots`
4. **Optional**: Delete `price.json` since you now have automated updates!

---

**Ready to deploy?** Just copy-paste those 4 SQL files into the Supabase Dashboard! 🚀
