-- Follow-up fix for environments that already applied 20261001_enable_chat_realtime.sql
-- Recreate support_ticket_replies RLS policies with valid admin check and explicit WITH CHECK.

DO $$
BEGIN
  IF to_regclass('public.support_ticket_replies') IS NULL THEN
    RAISE NOTICE 'public.support_ticket_replies does not exist, skipping policy fix';
    RETURN;
  END IF;

  DROP POLICY IF EXISTS "User own chat replies" ON public.support_ticket_replies;
  DROP POLICY IF EXISTS "Admin full chat access" ON public.support_ticket_replies;

  CREATE POLICY "User own chat replies" ON public.support_ticket_replies
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE id = support_ticket_replies.ticket_id
        AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE id = support_ticket_replies.ticket_id
        AND user_id = auth.uid()
    )
  );

  CREATE POLICY "Admin full chat access" ON public.support_ticket_replies
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND is_admin = true
    )
  );
END $$;
