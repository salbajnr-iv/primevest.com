# Supabase Admin Migration Runbook

This runbook defines a **repeatable rollout checklist** for Supabase admin migrations with explicit evidence capture, go/no-go criteria, and rollback ownership.

## Scope

Apply these SQL files in this exact order:

1. `sql/supabase-setup.sql`
2. `sql/supabase-migration-2024.sql`
3. `sql/supabase-fix-profile-upsert.sql`

Then run post-check automation:

4. `scripts/admin-migration-postcheck.sh`
5. `sql/supabase-admin-post-migration-validation.sql` (executed by script when `SUPABASE_DB_URL` + `psql` are available)

> Why this order: `supabase-setup.sql` defines base tables/triggers, `supabase-migration-2024.sql` adds operational admin functions/settings, and `supabase-fix-profile-upsert.sql` finalizes profile RLS for upsert behavior.

---

## 0) Preconditions

- You have project owner access to Supabase SQL Editor.
- You can access deployment environment variable settings (e.g., Vercel/Netlify/etc.).
- You have at least one real user account already created in `auth.users` (for admin promotion).
- You can run shell scripts in this repository.

---

## 1) Repeatable rollout checklist (operational gates)

> **Stop rule:** Do not mark P0 complete until all gates are green and evidence is archived.

| Gate | Owner | Action | Required evidence artifact | Rollback owner + action |
|---|---|---|---|---|
| G1: SQL migrations applied | DB Operator | Execute all 3 SQL files in order | Supabase SQL execution IDs + timestamps for each file | DB Operator: stop rollout, restore from PITR or apply targeted SQL rollback (section 6) |
| G2: Schema/function/RLS validation | DB Operator | Run `scripts/admin-migration-postcheck.sh` and review SQL validation output | `artifacts/admin-migration/<timestamp>/sql-validation.txt` and `summary.txt` | DB Operator: re-run failed migration chunk or restore prior definitions/policies |
| G3: Real admin creation | App Operator | Promote at least one real user with `public.set_admin_role(...)` and verify join to `admin_users` | SQL result showing `is_admin = true` and non-null `admin_user_id` for promoted UUID | App Operator: revoke admin flag for incorrect user and re-promote intended user |
| G4: Environment variable controls | App Operator | Validate required env vars and key separation | `artifacts/admin-migration/<timestamp>/env-check.txt` | App Operator: set missing/incorrect variables and redeploy |
| G5: Admin route strategy confirmed | Tech Lead / Release Owner | Confirm canonical admin route strategy (`/admin` only or subdomain + `/admin`) | Decision entry in execution log + linked deployment ticket | Release Owner: revert route config/redirects to last known good setup |
| G6: Go/No-Go decision | Release Owner | Confirm criteria in section 5 and sign-off | Signed execution log with owners and UTC timestamp | Release Owner: declare NO-GO and execute rollback plan in section 6 |

---

## 2) Apply migrations (SQL Editor)

In Supabase Dashboard → SQL Editor, run each file fully and save execution output.

### 2.1 Apply base setup

```sql
-- paste sql/supabase-setup.sql
```

### 2.2 Apply admin migration

```sql
-- paste sql/supabase-migration-2024.sql
```

### 2.3 Apply profile upsert/RLS fix

```sql
-- paste sql/supabase-fix-profile-upsert.sql
```

Record job IDs/timestamps for all three SQL runs in the execution log section.

---

## 3) Post-migration validation and evidence capture

Run one command from repository root:

```bash
scripts/admin-migration-postcheck.sh
```

What this captures automatically:

- Environment variable presence + key separation checks into `env-check.txt`
- SQL validation results into `sql-validation.txt` when `SUPABASE_DB_URL` and `psql` are available
- Summary status in `summary.txt`

Default archive location:

- `artifacts/admin-migration/<UTC_TIMESTAMP>/`

### Optional custom archive path

```bash
scripts/admin-migration-postcheck.sh /path/to/archive-root
```

### Manual fallback (if SQL execution is skipped)

If `SUPABASE_DB_URL` or `psql` is unavailable, run `sql/supabase-admin-post-migration-validation.sql` directly in Supabase SQL Editor and save the result export/screenshot next to the script artifacts.

### If `set_admin_role` is missing

If validation output does not return `set_admin_role`, create it explicitly:

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

Re-run `scripts/admin-migration-postcheck.sh` and archive new artifacts.

---

## 4) Create at least one real admin account (required)

1. Ensure the account exists in auth (normal signup flow is fine).
2. Find user UUID:

```sql
SELECT id, email, full_name, is_admin
FROM public.profiles
ORDER BY created_at DESC;
```

3. Promote to admin using required function call:

```sql
SELECT public.set_admin_role('REPLACE-WITH-USER-UUID');
```

4. Verify promotion evidence:

```sql
SELECT p.id, p.email, p.is_admin, au.id AS admin_user_id
FROM public.profiles p
LEFT JOIN public.admin_users au ON au.id = p.id
WHERE p.id = 'REPLACE-WITH-USER-UUID';
```

Expected: `is_admin = true` and `admin_user_id` is not null.

Archive this query output under the same rollout evidence directory.

---

## 5) Go / No-Go (mandatory before P0 completion)

Mark **GO** only when all criteria are true:

- All three migration SQL files completed successfully.
- Post-migration validation checks passed (tables, functions, RLS, policies).
- At least one real admin account was promoted via `public.set_admin_role(...)` and verified in `admin_users`.
- Required env vars are present and `SUPABASE_SERVICE_ROLE_KEY` is not exposed as `NEXT_PUBLIC_*`.
- Admin route strategy is explicitly confirmed:
  - `/admin` only, **or**
  - subdomain + `/admin` (`admin.bitpandaproapp.com` redirect strategy)
- Gate owners signed off in the execution log.

If any criterion fails, decision is **NO-GO** and section 6 rollback steps must be executed/owned.

---

## 6) Rollback plan and ownership

### 6.1 Immediate rollback trigger

Trigger rollback when any gate fails and cannot be remediated in-window.

- **Owner:** Release Owner
- **Action:** Declare NO-GO, freeze deployment, open incident ticket, assign DB + App operators.

### 6.2 Policy rollback (profiles upsert fix)

`sql/supabase-fix-profile-upsert.sql` contains policy rollback comments for restoration.

- **Owner:** DB Operator
- **Action:** restore previous RLS policy set, then re-validate.

### 6.3 Function rollback

If newly created functions are faulty, restore previous definitions from migration history or, at minimum:

```sql
DROP FUNCTION IF EXISTS public.adjust_balance(UUID, TEXT, DECIMAL, TEXT);
DROP FUNCTION IF EXISTS public.toggle_user_status(UUID, BOOLEAN);
DROP FUNCTION IF EXISTS public.get_admin_settings();
DROP FUNCTION IF EXISTS public.update_admin_settings(JSONB);
```

Then re-run known-good migration SQL.

- **Owner:** DB Operator

### 6.4 Data/state rollback

- Prefer point-in-time restore (PITR) for production incidents.
- If PITR unavailable: back up impacted rows first using `CREATE TABLE ... AS SELECT ...`, then apply targeted `DROP POLICY`, `DROP FUNCTION`, or `UPDATE` reversal statements.

- **Owner:** DB Operator with Release Owner approval.

### 6.5 Route/env rollback

- Revert admin route redirects or host strategy to last known good state.
- Revert environment variable changes and redeploy previous stable config.

- **Owner:** App Operator

---

## 7) Execution log (required for evidence archive)

- Environment: `dev / staging / prod`
- P0 Ticket / Incident link:
- Release Owner:
- DB Operator:
- App Operator:
- Date/time (UTC):
- Gate G1 result + SQL file 1 execution ID/result:
- Gate G1 result + SQL file 2 execution ID/result:
- Gate G1 result + SQL file 3 execution ID/result:
- Gate G2 validation artifact path (`summary.txt`, `sql-validation.txt`):
- Gate G3 promoted admin UUID + evidence path:
- Gate G4 env verification artifact path (`env-check.txt`):
- Gate G5 route strategy decision (`/admin` only vs subdomain + `/admin`) + owner:
- Final go/no-go decision + approver:
- Rollback required? (`yes/no`):
- Follow-up actions:
