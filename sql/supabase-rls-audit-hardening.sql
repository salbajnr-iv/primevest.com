-- RLS audit hardening for browser-facing tables.
-- Safe to run multiple times.

DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT *
    FROM (VALUES
      ('profiles', 'id'),
      ('notifications', 'user_id'),
      ('orders', 'user_id'),
      ('transactions', 'user_id'),
      ('watchlists', 'user_id'),
      ('kyc_requests', 'user_id'),
      ('kyc_documents', 'user_id'),
      ('support_tickets', 'user_id'),
      ('support_ticket_replies', 'user_id')
    ) AS t(table_name, owner_column)
  LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = rec.table_name
    )
    AND EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = rec.table_name
        AND column_name = rec.owner_column
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', rec.table_name);

      EXECUTE format('DROP POLICY IF EXISTS "rls_owner_select" ON public.%I', rec.table_name);
      EXECUTE format('DROP POLICY IF EXISTS "rls_owner_insert" ON public.%I', rec.table_name);
      EXECUTE format('DROP POLICY IF EXISTS "rls_owner_update" ON public.%I', rec.table_name);
      EXECUTE format('DROP POLICY IF EXISTS "rls_owner_delete" ON public.%I', rec.table_name);

      EXECUTE format(
        'CREATE POLICY "rls_owner_select" ON public.%I FOR SELECT TO authenticated USING (auth.uid() = %I)',
        rec.table_name,
        rec.owner_column
      );

      EXECUTE format(
        'CREATE POLICY "rls_owner_insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (auth.uid() = %I)',
        rec.table_name,
        rec.owner_column
      );

      EXECUTE format(
        'CREATE POLICY "rls_owner_update" ON public.%I FOR UPDATE TO authenticated USING (auth.uid() = %I) WITH CHECK (auth.uid() = %I)',
        rec.table_name,
        rec.owner_column,
        rec.owner_column
      );

      EXECUTE format(
        'CREATE POLICY "rls_owner_delete" ON public.%I FOR DELETE TO authenticated USING (auth.uid() = %I)',
        rec.table_name,
        rec.owner_column
      );
    END IF;
  END LOOP;
END
$$;

-- Performance: add policy-column indexes when columns exist.
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT *
    FROM (VALUES
      ('profiles', 'created_at'),
      ('notifications', 'user_id'),
      ('notifications', 'created_at'),
      ('orders', 'user_id'),
      ('orders', 'created_at'),
      ('transactions', 'user_id'),
      ('transactions', 'created_at'),
      ('watchlists', 'user_id'),
      ('watchlists', 'created_at'),
      ('kyc_requests', 'user_id'),
      ('kyc_requests', 'created_at'),
      ('kyc_documents', 'user_id'),
      ('kyc_documents', 'created_at'),
      ('support_tickets', 'user_id'),
      ('support_tickets', 'created_at'),
      ('support_ticket_replies', 'ticket_id'),
      ('support_ticket_replies', 'user_id'),
      ('support_ticket_replies', 'created_at')
    ) AS t(table_name, column_name)
  LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = rec.table_name
        AND column_name = rec.column_name
    ) THEN
      EXECUTE format(
        'CREATE INDEX IF NOT EXISTS %I ON public.%I (%I)',
        'idx_' || rec.table_name || '_' || rec.column_name,
        rec.table_name,
        rec.column_name
      );
    END IF;
  END LOOP;
END
$$;

-- SQL editor helper: current RLS and policy matrix for all public tables.
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
