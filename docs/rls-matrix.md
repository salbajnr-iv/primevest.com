# Supabase RLS audit matrix

This document is the companion audit artifact for browser/client-exposed tables and should be updated whenever policies or table access patterns change.

## 1) SQL editor query: list all `public` tables with RLS + policy coverage

Run in Supabase SQL editor:

```sql
SELECT
  t.tablename AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS force_rls,
  COALESCE(bool_or(p.cmd = 'SELECT'), false) AS has_select_policy,
  COALESCE(bool_or(p.cmd = 'INSERT'), false) AS has_insert_policy,
  COALESCE(bool_or(p.cmd = 'UPDATE'), false) AS has_update_policy,
  COALESCE(bool_or(p.cmd = 'DELETE'), false) AS has_delete_policy,
  CASE
    WHEN COUNT(p.*) = 0 THEN 'service-only / no policy path'
    WHEN bool_or(p.roles::text LIKE '%anon%') THEN 'anon + authenticated'
    WHEN bool_or(p.roles::text LIKE '%authenticated%') THEN 'authenticated'
    ELSE 'custom/service-only'
  END AS role_scope
FROM pg_tables t
JOIN pg_class c
  ON c.relname = t.tablename
 AND c.relnamespace = 'public'::regnamespace
LEFT JOIN pg_policies p
  ON p.schemaname = 'public'
 AND p.tablename = t.tablename
WHERE t.schemaname = 'public'
GROUP BY t.tablename, c.relrowsecurity, c.relforcerowsecurity
ORDER BY t.tablename;
```

## 2) Prioritized browser/client tables

From app code usage, prioritize:

- `profiles`
- `notifications`
- `orders`
- `transactions`
- `watchlists`
- KYC tables: `kyc_requests`, `kyc_documents`

## 3) Ownership policy standard

For user-owned rows, enforce stable-ID checks and write checks:

- `USING (auth.uid() = user_id)` (or `id` for `profiles`)
- `WITH CHECK (auth.uid() = user_id)` (or `id`) on `INSERT` and `UPDATE`

The migration `sql/supabase-rls-audit-hardening.sql` applies this convention with standardized policies:

- `rls_owner_select`
- `rls_owner_insert`
- `rls_owner_update`
- `rls_owner_delete`

for existing public tables with supported owner columns.

## 4) Index baseline for policy/filter columns

To avoid RLS/policy scan regressions, ensure indexes exist where columns exist:

- `user_id`
- `ticket_id`
- `created_at`

The same migration applies idempotent `CREATE INDEX IF NOT EXISTS` for prioritized tables.

## 5) Expected role scope notes

- Browser traffic should rely on `authenticated` policies for user-owned rows.
- `anon` should only be granted where explicitly intended.
- Service-role jobs bypass RLS by design; treat tables without user-facing policies as service-only.
