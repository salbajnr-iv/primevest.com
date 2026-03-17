-- Live Chat: Schema enhancements, indexes, RLS for realtime chat
-- Idempotent: safe to run multiple times
-- After: Enable realtime on support_ticket_replies in Supabase Dashboard > Database > Realtime
-- Run: cd supabase && supabase migration up

-- Add seen_at for read receipts (optional)
ALTER TABLE support_ticket_replies 
  ADD COLUMN IF NOT EXISTS seen_at timestamptz;

-- Indexes for chat queries
CREATE INDEX IF NOT EXISTS idx_replies_ticket_created 
  ON support_ticket_replies (ticket_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_replies_ticket_user 
  ON support_ticket_replies (ticket_id, user_id);

-- RLS: Users own tickets replies (no IF NOT EXISTS for policy)
DROP POLICY IF EXISTS "User own chat replies" ON public.support_ticket_replies;
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

-- Admins full access
DROP POLICY IF EXISTS "Admin full chat access" ON public.support_ticket_replies;
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

