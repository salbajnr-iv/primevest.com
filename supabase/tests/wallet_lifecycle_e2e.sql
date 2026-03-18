-- End-to-end wallet lifecycle checks for deposit/withdraw pending/success/failure/reversal.
-- Run in a staging Supabase database after applying migrations.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '55555555-5555-5555-5555-555555555555') THEN
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (
      '55555555-5555-5555-5555-555555555555',
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'wallet-e2e-user@example.com',
      crypt('not-used', gen_salt('bf')),
      now(),
      now(),
      now()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '66666666-6666-6666-6666-666666666666') THEN
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (
      '66666666-6666-6666-6666-666666666666',
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'wallet-e2e-admin@example.com',
      crypt('not-used', gen_salt('bf')),
      now(),
      now(),
      now()
    );
  END IF;
END $$;

INSERT INTO public.profiles (id, email, full_name, is_admin, is_active, kyc_status, account_balance)
VALUES ('55555555-5555-5555-5555-555555555555', 'wallet-e2e-user@example.com', 'Wallet E2E User', false, true, 'verified', 1000)
ON CONFLICT (id) DO UPDATE
SET is_active = true,
    is_admin = false,
    kyc_status = 'verified',
    account_balance = 1000,
    updated_at = now();

INSERT INTO public.profiles (id, email, full_name, is_admin, is_active, kyc_status, account_balance)
VALUES ('66666666-6666-6666-6666-666666666666', 'wallet-e2e-admin@example.com', 'Wallet E2E Admin', true, true, 'verified', 0)
ON CONFLICT (id) DO UPDATE
SET is_active = true,
    is_admin = true,
    kyc_status = 'verified',
    updated_at = now();

INSERT INTO public.wallets (user_id, asset, balance, available_balance, locked_balance)
VALUES ('55555555-5555-5555-5555-555555555555', 'USD', 1000, 1000, 0)
ON CONFLICT (user_id, asset) DO UPDATE
SET balance = 1000,
    available_balance = 1000,
    locked_balance = 0,
    updated_at = now();

-- 1) Deposit pending (intent created)
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '55555555-5555-5555-5555-555555555555', true);
SELECT * FROM public.create_deposit_intent('USD', 150, 'stripe', 'e2e-deposit-intent-1', 'stripe-ref-pending-1');

-- 2) Deposit success (callback settled)
WITH d AS (
  SELECT id FROM public.transactions WHERE idempotency_key = 'e2e-deposit-intent-1' LIMIT 1
)
SELECT * FROM public.confirm_deposit_callback((SELECT id FROM d), 'e2e-deposit-callback-success-1', 'stripe-ref-success-1', 150, '{"status":"succeeded"}'::jsonb);

-- 3) Withdrawal pending (request)
SELECT * FROM public.request_withdrawal_review('USD', 'dest-wallet-001', 100, 2, 'e2e-withdraw-req-1');

-- 4) Withdrawal success (approve then settle)
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '66666666-6666-6666-6666-666666666666', true);

WITH w AS (
  SELECT id FROM public.transactions WHERE idempotency_key = 'e2e-withdraw-req-1' LIMIT 1
)
SELECT * FROM public.review_withdrawal_request((SELECT id FROM w), 'approve', 'approved in e2e', 'e2e-approve-1');

WITH w AS (
  SELECT id FROM public.transactions WHERE idempotency_key = 'e2e-withdraw-req-1' LIMIT 1
)
SELECT * FROM public.settle_withdrawal_callback((SELECT id FROM w), 'e2e-withdraw-callback-success-1', 'succeeded', 'onramp-ref-success-1', '{"status":"succeeded"}'::jsonb);

-- 5) Withdrawal failure + reversal path
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '55555555-5555-5555-5555-555555555555', true);
SELECT * FROM public.request_withdrawal_review('USD', 'dest-wallet-002', 120, 2, 'e2e-withdraw-req-2');

RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '66666666-6666-6666-6666-666666666666', true);

WITH w AS (
  SELECT id FROM public.transactions WHERE idempotency_key = 'e2e-withdraw-req-2' LIMIT 1
)
SELECT * FROM public.review_withdrawal_request((SELECT id FROM w), 'approve', 'approved before failure', 'e2e-approve-2');

WITH w AS (
  SELECT id FROM public.transactions WHERE idempotency_key = 'e2e-withdraw-req-2' LIMIT 1
)
SELECT * FROM public.settle_withdrawal_callback((SELECT id FROM w), 'e2e-withdraw-callback-failed-1', 'failed', 'onramp-ref-failed-1', '{"status":"failed"}'::jsonb);

SELECT * FROM public.request_withdrawal_review('USD', 'dest-wallet-003', 90, 1, 'e2e-withdraw-req-3');

WITH w AS (
  SELECT id FROM public.transactions WHERE idempotency_key = 'e2e-withdraw-req-3' LIMIT 1
)
SELECT * FROM public.review_withdrawal_request((SELECT id FROM w), 'approve', 'approved before reversal', 'e2e-approve-3');

WITH w AS (
  SELECT id FROM public.transactions WHERE idempotency_key = 'e2e-withdraw-req-3' LIMIT 1
)
SELECT * FROM public.settle_withdrawal_callback((SELECT id FROM w), 'e2e-withdraw-callback-reversed-1', 'reversed', 'onramp-ref-reversed-1', '{"status":"reversed"}'::jsonb);

-- Final sanity checks
SELECT status, count(*)
FROM public.transactions
WHERE user_id = '55555555-5555-5555-5555-555555555555'
GROUP BY status
ORDER BY status;

SELECT count(*) AS audit_rows
FROM public.transaction_state_audit
WHERE user_id = '55555555-5555-5555-5555-555555555555';

ROLLBACK;
