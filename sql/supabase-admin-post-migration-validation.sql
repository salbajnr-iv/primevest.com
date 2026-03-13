-- Supabase Admin post-migration validation queries
-- Run after applying:
-- 1) sql/supabase-setup.sql
-- 2) sql/supabase-migration-2024.sql
-- 3) sql/supabase-fix-profile-upsert.sql

-- A) Required tables
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

-- B) Required functions
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

-- C) RLS enabled for critical tables
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

-- D) Policies on required tables
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'admin_users', 'admin_settings', 'kyc_requests')
ORDER BY tablename, policyname;

-- E) Real admin evidence: at least one promoted admin linked to admin_users
SELECT p.id,
       p.email,
       p.is_admin,
       p.updated_at,
       au.id AS admin_user_id,
       au.updated_at AS admin_user_updated_at
FROM public.profiles p
LEFT JOIN public.admin_users au ON au.id = p.id
WHERE p.is_admin = true
ORDER BY p.updated_at DESC
LIMIT 20;

-- F) Gate summary row (1 row): use this for go/no-go decision support
WITH checks AS (
  SELECT
    (SELECT COUNT(*) = 6
     FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name IN ('profiles','admin_users','admin_settings','kyc_requests','balance_history','admin_actions')) AS tables_ok,
    (SELECT COUNT(*) = 5
     FROM pg_proc p
     JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.proname IN ('adjust_balance','toggle_user_status','set_admin_role','get_admin_settings','update_admin_settings')) AS functions_ok,
    (SELECT COUNT(*) = 6
     FROM pg_class c
     JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public'
       AND c.relname IN ('profiles','admin_users','admin_settings','kyc_requests','balance_history','admin_actions')
       AND c.relrowsecurity = true) AS rls_ok,
    (SELECT COUNT(*) >= 1
     FROM public.profiles p
     JOIN public.admin_users au ON au.id = p.id
     WHERE p.is_admin = true) AS admin_exists_ok
)
SELECT tables_ok,
       functions_ok,
       rls_ok,
       admin_exists_ok,
       (tables_ok AND functions_ok AND rls_ok AND admin_exists_ok) AS technical_go
FROM checks;
