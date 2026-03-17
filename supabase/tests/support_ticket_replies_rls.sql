-- Manual SQL validation for support_ticket_replies RLS.
-- Run in a staging database after applying migrations.
-- This script validates behavior for anon, non-admin authenticated user, and admin user.

BEGIN;

-- Stable fixture IDs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = '11111111-1111-1111-1111-111111111111') THEN
    INSERT INTO public.profiles (id, email, full_name, is_admin)
    VALUES ('11111111-1111-1111-1111-111111111111', 'user1@example.com', 'User One', false);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = '22222222-2222-2222-2222-222222222222') THEN
    INSERT INTO public.profiles (id, email, full_name, is_admin)
    VALUES ('22222222-2222-2222-2222-222222222222', 'user2@example.com', 'User Two', false);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') THEN
    INSERT INTO public.profiles (id, email, full_name, is_admin)
    VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@example.com', 'Admin', true);
  END IF;
END $$;

INSERT INTO public.support_tickets (id, subject, message, status, user_id)
VALUES (900001, 'RLS Test Ticket', 'owned by user1', 'open', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id;

INSERT INTO public.support_ticket_replies (ticket_id, user_id, message, is_staff)
VALUES (900001, '11111111-1111-1111-1111-111111111111', 'seed reply', false)
ON CONFLICT DO NOTHING;

-- 1) ANON should not read rows
SET LOCAL ROLE anon;
SELECT count(*) AS anon_visible_replies FROM public.support_ticket_replies WHERE ticket_id = 900001;
RESET ROLE;

-- 2) Authenticated non-owner/non-admin should not read or insert for ticket 900001
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
SELECT count(*) AS non_admin_visible_replies FROM public.support_ticket_replies WHERE ticket_id = 900001;

-- Expected: ERROR due to RLS
SAVEPOINT non_admin_insert_attempt;
INSERT INTO public.support_ticket_replies (ticket_id, user_id, message, is_staff)
VALUES (900001, '22222222-2222-2222-2222-222222222222', 'should fail', false);
ROLLBACK TO SAVEPOINT non_admin_insert_attempt;
RESET ROLE;

-- 3) Authenticated owner should be able to read/insert
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
SELECT count(*) AS owner_visible_replies FROM public.support_ticket_replies WHERE ticket_id = 900001;
INSERT INTO public.support_ticket_replies (ticket_id, user_id, message, is_staff)
VALUES (900001, '11111111-1111-1111-1111-111111111111', 'owner insert should pass', false);
RESET ROLE;

-- 4) Authenticated admin should have full access
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true);
SELECT count(*) AS admin_visible_replies FROM public.support_ticket_replies WHERE ticket_id = 900001;
INSERT INTO public.support_ticket_replies (ticket_id, user_id, message, is_staff)
VALUES (900001, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin insert should pass', true);
UPDATE public.support_ticket_replies
SET message = 'admin updated'
WHERE ticket_id = 900001;
RESET ROLE;

ROLLBACK;
