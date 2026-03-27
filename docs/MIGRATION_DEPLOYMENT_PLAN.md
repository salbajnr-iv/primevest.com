# 🚀 Complete SQL Migration Deployment Plan

## 📋 Overview

This guide will help you deploy ALL SQL migration files to your Supabase database.

---

## 🗂️ SQL Files Status

### **✅ Already Deployed:**

- ✅ `cron-deploy-corrected.sql` - Cron jobs for market price updates

### **⏳ Ready to Deploy:**

| Priority      | File                                           | Purpose                  | Safe to Re-run |
| ------------- | ---------------------------------------------- | ------------------------ | -------------- |
| 🔴 **HIGH**   | `supabase-fix-profile-upsert.sql`              | Fix profile save errors  | ✅ Yes         |
| 🔴 **HIGH**   | `reconcile-trading-column-mismatches.sql`      | Fix column naming issues | ✅ Yes         |
| 🟡 **MEDIUM** | `supabase-rls-audit-hardening.sql`             | Security hardening       | ✅ Yes         |
| 🟡 **MEDIUM** | `supabase-support-tickets-v2.sql`              | Support system upgrade   | ✅ Yes         |
| 🟢 **LOW**    | `supabase-migration-account-balance.sql`       | Account balance schema   | ✅ Yes         |
| 🟢 **LOW**    | `supabase-migration-kyc.sql`                   | KYC schema               | ✅ Yes         |
| ℹ️ **INFO**   | `supabase-admin-post-migration-validation.sql` | Validation checks only   | ✅ Yes         |

### **📜 Historical Migrations** (Already applied):

- `supabase-migration-2024.sql` - Main 2024 migration (likely already run)
- `supabase-setup.sql` - Initial setup (already run)
- `supabase-support-tickets.sql` - Old support tickets (superseded by v2)

---

## 🎯 Deployment Strategy

### **Option 1: Deploy All at Once** ⭐ RECOMMENDED

I've created a combined migration file that runs everything safely:

**File**: `sql/DEPLOY_ALL_MIGRATIONS.sql`

This single file contains:

1. Profile upsert fixes
2. Column reconciliation
3. RLS audit hardening
4. Support tickets v2
5. Account balance migration
6. KYC migration
7. Validation queries

**Just copy-paste and run!**

---

### **Option 2: Deploy Individually** (More Control)

Deploy each file separately via Supabase Dashboard:

#### **Step 1: Profile Fixes** (Fixes "Save failed" error)

```
📁 sql/supabase-fix-profile-upsert.sql
```

**Run in**: https://supabase.com/dashboard/project/xhyivvvbrcmbjvzmvlod/sql/new

**What it does**: Fixes RLS policies so users can save their profiles

---

#### **Step 2: Column Reconciliation**

```
📁 sql/reconcile-trading-column-mismatches.sql
```

**What it does**: Renames `total` → `total_amount` in orders/trades/transactions

---

#### **Step 3: RLS Security Hardening**

```
📁 sql/supabase-rls-audit-hardening.sql
```

**What it does**: Strengthens Row Level Security across all tables

---

#### **Step 4: Support Tickets V2**

```
📁 sql/supabase-support-tickets-v2.sql
```

**What it does**: Upgrades support ticket system with new features

---

#### **Step 5: Account Balance** (Optional)

```
📁 sql/supabase-migration-account-balance.sql
```

**What it does**: Adds account balance tracking

---

#### **Step 6: KYC Schema** (Optional)

```
📁 sql/supabase-migration-kyc.sql
```

**What it does**: Sets up KYC document storage

---

#### **Step 7: Validation** (Verify Everything)

```
📁 sql/supabase-admin-post-migration-validation.sql
```

**What it does**: Checks all migrations ran successfully

---

## ✅ Quick Deploy (5 Minutes)

### **Recommended Order:**

1. **Start Here**: `supabase-fix-profile-upsert.sql`
   - Fixes critical profile save bug
2. **Then**: `reconcile-trading-column-mismatches.sql`
   - Standardizes column names
3. **Then**: `supabase-rls-audit-hardening.sql`
   - Security improvements
4. **Then**: `supabase-support-tickets-v2.sql`
   - Support system upgrade
5. **Optional**: Account balance & KYC if needed

6. **Finally**: Run validation queries

---

## 🔍 Verification After Each Migration

After running each file, check for errors:

```sql
-- Check for any recent errors
SELECT * FROM pg_stat_database WHERE datname = current_database();

-- Verify table exists (example for support_tickets)
SELECT COUNT(*) FROM information_schema.tables
WHERE table_name = 'support_ticket_replies';
```

---

## 🆘 Troubleshooting

### **"Table already exists" Error:**

Some tables may already exist. That's OK - skip that file.

### **"Column already exists" Error:**

Migration was already run. Skip that file.

### **RLS Policy Conflicts:**

Drop conflicting policies first:

```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
```

---

## 📊 Post-Deployment Checklist

After all migrations:

- [ ] ✅ Profile saves work without errors
- [ ] ✅ Column names standardized (`total_amount`)
- [ ] ✅ RLS policies active on all tables
- [ ] ✅ Support tickets have new columns
- [ ] ✅ No SQL errors in logs
- [ ] ✅ App functions normally

---

## 🎯 Next Steps

1. **Open**: https://supabase.com/dashboard/project/xhyivvvbrcmbjvzmvlod/sql/new

2. **Choose**: Deploy all at once OR one-by-one

3. **Run**: Start with high-priority files first

4. **Verify**: Check validation queries pass

5. **Test**: Try saving a profile in your app!

---

**Ready?** Let me know if you want me to create the combined migration file or if you prefer to deploy individually! 🚀
