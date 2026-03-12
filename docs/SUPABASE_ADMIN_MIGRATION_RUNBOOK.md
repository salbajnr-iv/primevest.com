# Supabase Admin Migration Runbook

This runbook captures a reproducible process for applying the admin-related SQL migrations and validating the environment for the admin dashboard.

## Scope

Apply these SQL files in this exact order:

1. `sql/supabase-setup.sql`
2. `sql/supabase-migration-2024.sql`
3. `sql/supabase-fix-profile-upsert.sql`

> Why this order: `supabase-setup.sql` defines base tables/triggers, `supabase-migration-2024.sql` adds operational admin functions/settings, and `supabase-fix-profile-upsert.sql` finalizes profile RLS for upsert behavior.

---

## 0) Preconditions

- You have project owner access to Supabase SQL Editor.
- You can access deployment environment variable settings (e.g., Vercel/Netlify/etc.).
- You have at least one real user account already created in `auth.users` (for admin promotion).

---

## 1) Apply migrations (SQL Editor)

In Supabase Dashboard → SQL Editor, run each file fully and save execution output:

### 1.1 Apply base setup

```sql
-- paste sql/supabase-setup.sql
```

### 1.2 Apply admin migration

```sql
-- paste sql/supabase-migration-2024.sql
```

### 1.3 Apply profile upsert/RLS fix

```sql
-- paste sql/supabase-fix-profile-upsert.sql
```

Record job IDs / timestamps for all three SQL runs in the execution log section at the bottom.

---

## 2) Validation queries (tables, functions, policies)

Run the full block below after all 3 scripts complete.

```sql
-- 2.1 Required tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'profiles',
    'admin_users',
    'admin_settings',
    'kyc_requests',
    'balance_history',
    'admin_actions'
  )
ORDER BY table_name;

-- 2.2 Required functions
SELECT p.proname AS function_name,
       pg_get_function_arguments(p.oid) AS args
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
    'adjust_balance',
    'toggle_user_status',
    'set_admin_role',
    'get_admin_settings',
    'update_admin_settings'
  )
ORDER BY p.proname;

-- 2.3 RLS enabled for critical tables
SELECT c.relname AS table_name,
       c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN (
    'profiles',
    'admin_users',
    'admin_settings',
    'kyc_requests',
    'balance_history',
    'admin_actions'
  )
ORDER BY c.relname;

-- 2.4 Policies on required tables
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'admin_users', 'admin_settings', 'kyc_requests')
ORDER BY tablename, policyname;
```

### If `set_admin_role` is missing

If query 2.2 does not return `set_admin_role`, create it explicitly:

```sql
CREATE OR REPLACE FUNCTION public.set_admin_role(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET is_admin = true,
      updated_at = NOW()
  WHERE id = p_user_id;

  INSERT INTO public.admin_users (id, email, full_name)
  SELECT id, email, full_name
  FROM public.profiles
  WHERE id = p_user_id
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = NOW();
END;
$$;
```

---

## 3) Create at least one real admin account

1. Ensure the account exists in auth (normal signup flow is fine).
2. Find user UUID:

```sql
SELECT id, email, full_name, is_admin
FROM public.profiles
ORDER BY created_at DESC;
```

3. Promote to admin:

```sql
SELECT public.set_admin_role('REPLACE-WITH-USER-UUID');
```

4. Verify:

```sql
SELECT p.id, p.email, p.is_admin, au.id AS admin_user_id
FROM public.profiles p
LEFT JOIN public.admin_users au ON au.id = p.id
WHERE p.id = 'REPLACE-WITH-USER-UUID';
```

Expected: `is_admin = true` and `admin_user_id` is not null.

---

## 4) Verify deployment environment variables

Minimum required keys:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (required by server/admin APIs)

### Verification checklist

- Confirm all keys exist in deployment provider for Production + Preview (if used).
- Confirm `SUPABASE_SERVICE_ROLE_KEY` is **server-only** (never exposed as `NEXT_PUBLIC_*`).
- Redeploy after changes.

### Why service role key is required

Admin/server API routes rely on `SUPABASE_SERVICE_ROLE_KEY` to perform privileged operations (admin user deletion/impersonation, KYC moderation, simulations, order-side writes).

---

## 5) Admin route host strategy

Current codebase strategy supports both:

- Primary path-based admin UI: `/admin/...`
- Optional subdomain host-based routing for `admin.bitpandaproapp.com` via Next.js redirects

If deployment no longer uses the subdomain, keep `/admin` as canonical route and update DNS/redirect expectations in deployment docs.

---

## 6) Rollback notes

### 6.1 Policy rollback (profiles upsert fix)

`sql/supabase-fix-profile-upsert.sql` already contains rollback SQL comments for policy restoration.

### 6.2 Function rollback

If a newly created function is faulty, revert by restoring previous definition from migration history, or at minimum:

```sql
DROP FUNCTION IF EXISTS public.adjust_balance(UUID, TEXT, DECIMAL, TEXT);
DROP FUNCTION IF EXISTS public.toggle_user_status(UUID, BOOLEAN);
DROP FUNCTION IF EXISTS public.get_admin_settings();
DROP FUNCTION IF EXISTS public.update_admin_settings(JSONB);
```

Then re-run known good migration SQL.

### 6.3 Table/data rollback guidance

- Prefer point-in-time restore (PITR) for production incidents.
- If no PITR: backup impacted rows first using `CREATE TABLE ... AS SELECT ...`, then apply targeted `DROP POLICY`, `DROP FUNCTION`, or `UPDATE` reversal statements.

---

## 7) Execution log (fill during rollout)

- Environment: `dev / staging / prod`
- Operator:
- Date/time (UTC):
- SQL file 1 execution ID/result:
- SQL file 2 execution ID/result:
- SQL file 3 execution ID/result:
- Validation query result summary:
- Admin UUID promoted:
- Env var verification completed by:
- Route host decision (`/admin` only vs subdomain + /admin):
- Rollback required? (`yes/no`):
- Incident/ticket link:
