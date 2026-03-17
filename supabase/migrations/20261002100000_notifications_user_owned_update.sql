-- Enforce user-owned access controls for notifications updates.
-- - Adds/refreshes UPDATE policy for authenticated users.
-- - Verifies SELECT policy uses the same ownership predicate.
-- - Verifies RLS is enabled on notifications.

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_can_update_notifications ON public.notifications;
CREATE POLICY user_can_update_notifications
ON public.notifications
FOR UPDATE TO authenticated
USING (user_id = auth.uid()::uuid)
WITH CHECK (user_id = auth.uid()::uuid);

DO $$
DECLARE
  select_policy_matches boolean;
  rls_enabled boolean;
BEGIN
  SELECT c.relrowsecurity
    INTO rls_enabled
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'notifications';

  IF COALESCE(rls_enabled, false) = false THEN
    RAISE EXCEPTION 'RLS must be enabled on public.notifications';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM pg_policies p
    WHERE p.schemaname = 'public'
      AND p.tablename = 'notifications'
      AND p.cmd = 'SELECT'
      AND p.qual IS NOT NULL
      AND p.qual LIKE '%user_id%auth.uid()%::uuid%'
  )
  INTO select_policy_matches;

  IF NOT select_policy_matches THEN
    RAISE EXCEPTION 'Expected a SELECT policy on public.notifications using user_id = auth.uid()::uuid';
  END IF;
END
$$;
