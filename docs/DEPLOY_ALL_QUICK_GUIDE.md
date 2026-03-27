# 🚀 Deploy ALL Migrations - QUICK GUIDE

## ✅ What I Created

I've combined ALL your SQL migrations into **ONE simple file**:

**📁 `sql/DEPLOY_ALL_MIGRATIONS.sql`** (303 lines)

This single file includes:

1. ✅ Profile fixes (fixes "Save failed" error)
2. ✅ Column reconciliation (`total` → `total_amount`)
3. ✅ RLS security hardening
4. ✅ Support tickets v2 upgrade
5. ✅ Account balance migration
6. ✅ KYC tables & fields
7. ✅ Validation queries

---

## 🎯 Deploy in 2 Minutes

### **Step 1: Open Supabase Dashboard**

Go to: **https://supabase.com/dashboard/project/xhyivvvbrcmbjvzmvlod/sql/new**

### **Step 2: Copy & Paste**

1. Open: `c:\Users\DELL 7480\SALBA-JNR\htdocs\primevest.com\sql\DEPLOY_ALL_MIGRATIONS.sql`
2. Copy the **entire content**
3. Paste into Supabase SQL editor
4. Click **"Run"**

### **Step 3: Check Results**

You should see:

```
✅ DROP POLICY (multiple times)
✅ CREATE POLICY (multiple times)
✅ reconcile_column_name (3 times)
✅ ALTER TABLE (multiple)
✅ CREATE TABLE IF NOT EXISTS
✅ CREATE INDEX IF NOT EXISTS
✅ Validation query results
```

---

## 📊 What Gets Deployed

### **Part 1: Profile Fixes** 🔴 CRITICAL

- Drops conflicting RLS policies
- Creates clean, working policies
- **Fixes**: "Save failed {}" error when users update profiles

### **Part 2: Column Reconciliation** 🟡 IMPORTANT

- Renames `total` → `total_amount` in:
  - `orders` table
  - `trades` table
  - `transactions` table
- **Why**: Standardizes naming across database

### **Part 3: RLS Security Hardening** 🟡 IMPORTANT

- Enables Row Level Security on all tables
- Ensures users can only access their own data
- **Tables**: profiles, notifications, orders, transactions, watchlists, KYC, support

### **Part 4: Support Tickets V2** 🟢 UPGRADE

- Adds new columns to `support_tickets`:
  - `user_id`, `updated_at`, `open_at`, `pending_at`, `resolved_at`, `closed_at`
- Creates `support_ticket_replies` table for threaded conversations
- **Why**: Better support ticket management

### **Part 5: Account Balance** 🟢 NEW FEATURE

- Adds `account_balance` column to profiles
- Migrates old `balance` data if exists
- Adds `is_admin`, `is_active` flags
- **Why**: Better balance tracking

### **Part 6: KYC System** 🟢 NEW FEATURE

- Creates `kyc_requests` table
- Creates `kyc_documents` table
- Adds KYC status enum
- **Why**: Full KYC document workflow

### **Part 7: Validation** ✅ VERIFY

- Checks all tables created correctly
- Verifies key columns exist
- Lists RLS policies
- **Why**: Confirms everything works

---

## ✅ Success Indicators

After running, you should see:

```
✅ All DROP POLICY statements succeed
✅ All CREATE POLICY statements succeed
✅ reconcile_column_name runs 3 times
✅ ALTER TABLE completes
✅ CREATE TABLE IF NOT EXISTS (no errors)
✅ CREATE INDEX IF NOT EXISTS (no errors)
✅ Validation queries return results
```

**No errors = Success!** 🎉

---

## 🔍 Verify It Worked

Run these quick checks:

### **1. Check Profile Policies:**

```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
```

**Should show:**

- `authenticated_select_profiles`
- `authenticated_insert_profiles`
- `authenticated_update_profiles`

### **2. Check New Tables:**

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('kyc_requests', 'kyc_documents', 'support_ticket_replies');
```

**Should return:** All 3 tables

### **3. Check Profile Columns:**

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name IN ('account_balance', 'is_admin', 'is_active', 'kyc_status');
```

**Should show:** All 4 columns with their types

---

## 🆘 Troubleshooting

### **"Policy already exists" Error:**

That's OK! Means some migrations already ran. Continue.

### **"Table already exists" Error:**

Also OK! Table exists, which is what we want.

### **"Column already exists" Error:**

Migration already applied. Skip that part.

### **Type "kyc_status" already exists:**

Expected - type was created previously.

---

## 📱 After Deployment

### **Immediate Actions:**

1. **Test Profile Saves**: Try updating a user profile in your app
2. **Check Support Tickets**: Verify ticket system works
3. **Monitor Logs**: Watch for any SQL errors

### **Wait & Monitor:**

- **Cron jobs**: Will run every 15 min / hour (market prices)
- **Profile updates**: Should work without errors now
- **Support tickets**: New reply system active

---

## 🎉 Post-Deployment Checklist

After running the migration:

- [ ] ✅ No SQL errors in output
- [ ] ✅ Profile policies created (3 policies)
- [ ] ✅ Support ticket replies table exists
- [ ] ✅ KYC tables created
- [ ] ✅ Account balance column added
- [ ] ✅ Validation queries pass
- [ ] ✅ App profile saves work
- [ ] ✅ Cron jobs still scheduled

---

## 🔗 Quick Links

- **SQL File**: [`sql/DEPLOY_ALL_MIGRATIONS.sql`](file:///c:/Users/DELL%207480/SALBA-JNR/htdocs/primevest.com/sql/DEPLOY_ALL_MIGRATIONS.sql)
- **Dashboard**: https://supabase.com/dashboard/project/xhyivvvbrcmbjvzmvlod/sql/new
- **Full Plan**: [`MIGRATION_DEPLOYMENT_PLAN.md`](file:///c:/Users/DELL%207480/SALBA-JNR/htdocs/primevest.com/MIGRATION_DEPLOYMENT_PLAN.md)

---

## 🚀 Ready to Deploy?

**Just copy-paste this ONE file and you're done!**

📁 **File**: `sql/DEPLOY_ALL_MIGRATIONS.sql`

**Takes 2 minutes, deploys 7 critical migrations at once!** 🎯

---

**Questions?** See troubleshooting section above or check individual migration files for details.
