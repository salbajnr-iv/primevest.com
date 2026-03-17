-- Provider webhook mapping, compliance gates, idempotent state transitions,
-- and withdrawal approval/settlement workflow tied to wallet balances.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'transaction_status'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public' AND t.typname = 'transaction_status' AND e.enumlabel = 'deposit_failed'
    ) THEN
      ALTER TYPE public.transaction_status ADD VALUE 'deposit_failed';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public' AND t.typname = 'transaction_status' AND e.enumlabel = 'withdraw_completed'
    ) THEN
      ALTER TYPE public.transaction_status ADD VALUE 'withdraw_completed';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public' AND t.typname = 'transaction_status' AND e.enumlabel = 'withdraw_failed'
    ) THEN
      ALTER TYPE public.transaction_status ADD VALUE 'withdraw_failed';
    END IF;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.transaction_state_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_status public.transaction_status,
  to_status public.transaction_status NOT NULL,
  actor_id uuid REFERENCES auth.users(id),
  actor_type text NOT NULL DEFAULT 'system',
  idempotency_key text,
  reason text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_transaction_state_audit_idempotency
  ON public.transaction_state_audit (transaction_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transaction_state_audit_tx_created
  ON public.transaction_state_audit (transaction_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.create_deposit_intent(
  p_currency text,
  p_amount numeric,
  p_provider text,
  p_idempotency_key text DEFAULT NULL,
  p_external_reference text DEFAULT NULL
)
RETURNS TABLE(
  success boolean,
  code text,
  message text,
  transaction_id uuid,
  status public.transaction_status
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_tx public.transactions%ROWTYPE;
  v_profile public.profiles%ROWTYPE;
  v_wallet public.wallets%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'UNAUTHENTICATED', 'authentication required', NULL::uuid, NULL::public.transaction_status;
    RETURN;
  END IF;

  SELECT * INTO v_profile FROM public.profiles WHERE id = v_user_id;
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'PROFILE_NOT_FOUND', 'profile not found', NULL::uuid, NULL::public.transaction_status;
    RETURN;
  END IF;

  IF v_profile.is_active IS DISTINCT FROM TRUE THEN
    RETURN QUERY SELECT FALSE, 'COMPLIANCE_BLOCKED', 'account is disabled for compliance review', NULL::uuid, NULL::public.transaction_status;
    RETURN;
  END IF;

  IF v_profile.kyc_status <> 'verified'::public.kyc_status THEN
    RETURN QUERY SELECT FALSE, 'KYC_REQUIRED', 'kyc verification required before deposit', NULL::uuid, NULL::public.transaction_status;
    RETURN;
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN QUERY SELECT FALSE, 'INVALID_AMOUNT', 'amount must be greater than zero', NULL::uuid, NULL::public.transaction_status;
    RETURN;
  END IF;

  IF COALESCE(trim(p_currency), '') = '' THEN
    RETURN QUERY SELECT FALSE, 'INVALID_CURRENCY', 'currency is required', NULL::uuid, NULL::public.transaction_status;
    RETURN;
  END IF;

  IF COALESCE(trim(p_provider), '') = '' THEN
    RETURN QUERY SELECT FALSE, 'INVALID_PROVIDER', 'provider is required', NULL::uuid, NULL::public.transaction_status;
    RETURN;
  END IF;

  IF p_idempotency_key IS NOT NULL THEN
    SELECT * INTO v_tx FROM public.transactions WHERE idempotency_key = p_idempotency_key LIMIT 1;

    IF FOUND THEN
      IF v_tx.user_id = v_user_id AND v_tx.type = 'deposit' THEN
        RETURN QUERY SELECT TRUE, 'IDEMPOTENT_REPLAY', 'deposit intent already exists', v_tx.id, v_tx.status;
      ELSE
        RETURN QUERY SELECT FALSE, 'IDEMPOTENCY_CONFLICT', 'idempotency key already used', NULL::uuid, NULL::public.transaction_status;
      END IF;
      RETURN;
    END IF;
  END IF;

  INSERT INTO public.wallets (user_id, asset, balance, available_balance, locked_balance)
  VALUES (v_user_id, upper(p_currency), 0, 0, 0)
  ON CONFLICT (user_id, asset) DO UPDATE SET updated_at = now()
  RETURNING * INTO v_wallet;

  INSERT INTO public.transactions (
    user_id, wallet_id, asset, type, category, amount, fee_amount, total_amount,
    balance_delta, status, idempotency_key, external_reference, metadata
  ) VALUES (
    v_user_id, v_wallet.id, upper(p_currency), 'deposit', 'deposit', p_amount, 0, p_amount,
    p_amount, 'deposit_initiated', p_idempotency_key, p_external_reference,
    jsonb_build_object('provider', p_provider, 'lifecycle', 'initiated')
  )
  RETURNING * INTO v_tx;

  INSERT INTO public.transaction_state_audit (
    transaction_id, user_id, from_status, to_status, actor_id, actor_type, idempotency_key, reason, payload
  ) VALUES (
    v_tx.id, v_user_id, NULL, v_tx.status, v_user_id, 'user', p_idempotency_key,
    'deposit intent created',
    jsonb_build_object('provider', p_provider, 'external_reference', p_external_reference)
  );

  RETURN QUERY SELECT TRUE, 'OK', 'deposit intent created', v_tx.id, v_tx.status;
END;
$$;

CREATE OR REPLACE FUNCTION public.request_withdrawal_review(
  p_currency text,
  p_destination text,
  p_amount numeric,
  p_fee numeric DEFAULT 0,
  p_idempotency_key text DEFAULT NULL
)
RETURNS TABLE(
  success boolean,
  code text,
  message text,
  transaction_id uuid,
  payout numeric,
  balance_before numeric,
  balance_after numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_profile public.profiles%ROWTYPE;
  v_tx public.transactions%ROWTYPE;
  v_wallet public.wallets%ROWTYPE;
  v_payout numeric;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'UNAUTHENTICATED', 'authentication required', NULL::uuid, NULL::numeric, NULL::numeric, NULL::numeric;
    RETURN;
  END IF;

  SELECT * INTO v_profile FROM public.profiles WHERE id = v_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'PROFILE_NOT_FOUND', 'profile not found', NULL::uuid, NULL::numeric, NULL::numeric, NULL::numeric;
    RETURN;
  END IF;

  IF v_profile.is_active IS DISTINCT FROM TRUE THEN
    RETURN QUERY SELECT FALSE, 'COMPLIANCE_BLOCKED', 'account is disabled for compliance review', NULL::uuid, NULL::numeric, v_profile.account_balance, v_profile.account_balance;
    RETURN;
  END IF;

  IF v_profile.kyc_status <> 'verified'::public.kyc_status THEN
    RETURN QUERY SELECT FALSE, 'KYC_REQUIRED', 'kyc verification required before withdrawal', NULL::uuid, NULL::numeric, v_profile.account_balance, v_profile.account_balance;
    RETURN;
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN QUERY SELECT FALSE, 'INVALID_AMOUNT', 'amount must be greater than zero', NULL::uuid, NULL::numeric, v_profile.account_balance, v_profile.account_balance;
    RETURN;
  END IF;

  IF p_fee IS NULL OR p_fee < 0 OR p_fee >= p_amount THEN
    RETURN QUERY SELECT FALSE, 'INVALID_FEE', 'fee must be non-negative and lower than amount', NULL::uuid, NULL::numeric, v_profile.account_balance, v_profile.account_balance;
    RETURN;
  END IF;

  IF COALESCE(trim(p_destination), '') = '' THEN
    RETURN QUERY SELECT FALSE, 'INVALID_DESTINATION', 'destination is required', NULL::uuid, NULL::numeric, v_profile.account_balance, v_profile.account_balance;
    RETURN;
  END IF;

  v_payout := p_amount - p_fee;

  IF p_idempotency_key IS NOT NULL THEN
    SELECT * INTO v_tx FROM public.transactions WHERE idempotency_key = p_idempotency_key LIMIT 1;
    IF FOUND THEN
      IF v_tx.user_id = v_user_id AND v_tx.type = 'withdrawal' THEN
        RETURN QUERY SELECT TRUE, 'IDEMPOTENT_REPLAY', 'withdrawal request already exists', v_tx.id, ((v_tx.amount - COALESCE(v_tx.fee_amount, 0))::numeric), NULL::numeric, NULL::numeric;
      ELSE
        RETURN QUERY SELECT FALSE, 'IDEMPOTENCY_CONFLICT', 'idempotency key already used', NULL::uuid, NULL::numeric, v_profile.account_balance, v_profile.account_balance;
      END IF;
      RETURN;
    END IF;
  END IF;

  INSERT INTO public.wallets (user_id, asset, balance, available_balance, locked_balance)
  VALUES (v_user_id, upper(p_currency), 0, 0, 0)
  ON CONFLICT (user_id, asset) DO UPDATE SET updated_at = now()
  RETURNING * INTO v_wallet;

  SELECT * INTO v_wallet FROM public.wallets WHERE id = v_wallet.id FOR UPDATE;

  IF v_wallet.available_balance < p_amount THEN
    RETURN QUERY SELECT FALSE, 'INSUFFICIENT_FUNDS', 'insufficient wallet balance', NULL::uuid, v_payout, v_profile.account_balance, v_profile.account_balance;
    RETURN;
  END IF;

  UPDATE public.wallets
  SET available_balance = available_balance - p_amount,
      locked_balance = locked_balance + p_amount,
      updated_at = now()
  WHERE id = v_wallet.id;

  UPDATE public.profiles
  SET account_balance = account_balance - p_amount,
      updated_at = now()
  WHERE id = v_user_id;

  INSERT INTO public.transactions (
    user_id, wallet_id, asset, type, category, amount, fee_amount, total_amount,
    balance_delta, status, idempotency_key, metadata
  ) VALUES (
    v_user_id, v_wallet.id, upper(p_currency), 'withdrawal', 'withdraw', p_amount, p_fee, v_payout,
    -p_amount, 'withdraw_requested', p_idempotency_key,
    jsonb_build_object('destination', p_destination, 'lifecycle', 'requested')
  ) RETURNING * INTO v_tx;

  INSERT INTO public.balance_history (
    user_id, admin_id, action_type, currency, amount, previous_balance, new_balance, reason
  ) VALUES (
    v_user_id, v_user_id, 'subtract', upper(p_currency), p_amount,
    v_profile.account_balance, v_profile.account_balance - p_amount, 'withdrawal requested'
  );

  INSERT INTO public.transaction_state_audit (
    transaction_id, user_id, from_status, to_status, actor_id, actor_type, idempotency_key, reason, payload
  ) VALUES (
    v_tx.id, v_user_id, NULL, v_tx.status, v_user_id, 'user', p_idempotency_key,
    'withdrawal request submitted', jsonb_build_object('destination', p_destination)
  );

  INSERT INTO public.admin_actions (
    admin_id, action_type, target_user_id, target_table, new_value
  ) VALUES (
    v_user_id, 'withdraw_request_submitted', v_user_id, 'transactions',
    jsonb_build_object('transaction_id', v_tx.id, 'status', v_tx.status, 'amount', p_amount, 'fee', p_fee, 'destination', p_destination)
  );

  RETURN QUERY SELECT TRUE, 'OK', 'withdrawal request submitted', v_tx.id, v_payout, v_profile.account_balance, v_profile.account_balance - p_amount;
END;
$$;

CREATE OR REPLACE FUNCTION public.confirm_deposit_callback(
  p_transaction_id uuid,
  p_callback_idempotency_key text,
  p_external_reference text DEFAULT NULL,
  p_settled_amount numeric DEFAULT NULL,
  p_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE(
  success boolean,
  code text,
  message text,
  transaction_id uuid,
  balance_before numeric,
  balance_after numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tx public.transactions%ROWTYPE;
  v_profile public.profiles%ROWTYPE;
  v_wallet public.wallets%ROWTYPE;
  v_amount numeric;
BEGIN
  IF p_transaction_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'INVALID_TRANSACTION', 'transaction id is required', NULL::uuid, NULL::numeric, NULL::numeric;
    RETURN;
  END IF;

  IF COALESCE(trim(p_callback_idempotency_key), '') = '' THEN
    RETURN QUERY SELECT FALSE, 'INVALID_IDEMPOTENCY_KEY', 'callback idempotency key is required', NULL::uuid, NULL::numeric, NULL::numeric;
    RETURN;
  END IF;

  SELECT * INTO v_tx FROM public.transactions WHERE callback_idempotency_key = p_callback_idempotency_key LIMIT 1;
  IF FOUND THEN
    SELECT * INTO v_profile FROM public.profiles WHERE id = v_tx.user_id;
    RETURN QUERY SELECT TRUE, 'IDEMPOTENT_REPLAY', 'callback already processed', v_tx.id, v_profile.account_balance, v_profile.account_balance;
    RETURN;
  END IF;

  SELECT * INTO v_tx
  FROM public.transactions
  WHERE id = p_transaction_id AND type = 'deposit'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'NOT_FOUND', 'deposit transaction not found', NULL::uuid, NULL::numeric, NULL::numeric;
    RETURN;
  END IF;

  IF v_tx.status NOT IN ('deposit_initiated', 'deposit_confirmed') THEN
    RETURN QUERY SELECT FALSE, 'INVALID_STATE', 'deposit cannot be confirmed from current state', v_tx.id, NULL::numeric, NULL::numeric;
    RETURN;
  END IF;

  v_amount := COALESCE(p_settled_amount, v_tx.amount);
  IF v_amount IS NULL OR v_amount <= 0 THEN
    RETURN QUERY SELECT FALSE, 'INVALID_AMOUNT', 'settled amount must be positive', v_tx.id, NULL::numeric, NULL::numeric;
    RETURN;
  END IF;

  SELECT * INTO v_profile FROM public.profiles WHERE id = v_tx.user_id FOR UPDATE;
  SELECT * INTO v_wallet FROM public.wallets WHERE id = v_tx.wallet_id FOR UPDATE;

  UPDATE public.transactions
  SET status = 'deposit_confirmed',
      callback_idempotency_key = p_callback_idempotency_key,
      external_reference = COALESCE(p_external_reference, external_reference),
      total_amount = v_amount,
      balance_delta = v_amount,
      metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('lifecycle', 'confirmed', 'confirmed_at', now(), 'callback_payload', COALESCE(p_payload, '{}'::jsonb)),
      updated_at = now()
  WHERE id = v_tx.id;

  UPDATE public.wallets
  SET balance = balance + v_amount,
      available_balance = available_balance + v_amount,
      updated_at = now()
  WHERE id = v_wallet.id;

  UPDATE public.profiles
  SET account_balance = account_balance + v_amount,
      updated_at = now()
  WHERE id = v_tx.user_id;

  INSERT INTO public.balance_history (
    user_id, admin_id, action_type, currency, amount, previous_balance, new_balance, reason
  ) VALUES (
    v_tx.user_id, v_tx.user_id, 'add', upper(v_tx.asset), v_amount,
    v_profile.account_balance, v_profile.account_balance + v_amount, 'deposit confirmed callback'
  );

  INSERT INTO public.transaction_state_audit (
    transaction_id, user_id, from_status, to_status, actor_type, idempotency_key, reason, payload
  ) VALUES (
    v_tx.id, v_tx.user_id, v_tx.status, 'deposit_confirmed', 'provider',
    p_callback_idempotency_key, 'deposit callback confirmed', COALESCE(p_payload, '{}'::jsonb)
  );

  RETURN QUERY SELECT TRUE, 'OK', 'deposit confirmed', v_tx.id, v_profile.account_balance, v_profile.account_balance + v_amount;
END;
$$;

CREATE OR REPLACE FUNCTION public.review_withdrawal_request(
  p_transaction_id uuid,
  p_decision text,
  p_reason text DEFAULT NULL,
  p_admin_action_idempotency_key text DEFAULT NULL
)
RETURNS TABLE(
  success boolean,
  code text,
  message text,
  transaction_id uuid,
  status public.transaction_status
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_admin_profile public.profiles%ROWTYPE;
  v_tx public.transactions%ROWTYPE;
  v_wallet public.wallets%ROWTYPE;
  v_profile public.profiles%ROWTYPE;
BEGIN
  IF v_admin_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'UNAUTHENTICATED', 'authentication required', NULL::uuid, NULL::public.transaction_status;
    RETURN;
  END IF;

  SELECT * INTO v_admin_profile FROM public.profiles WHERE id = v_admin_id;
  IF NOT FOUND OR v_admin_profile.is_admin IS DISTINCT FROM TRUE THEN
    RETURN QUERY SELECT FALSE, 'FORBIDDEN', 'admin privileges required', NULL::uuid, NULL::public.transaction_status;
    RETURN;
  END IF;

  IF p_transaction_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'INVALID_TRANSACTION', 'transaction id is required', NULL::uuid, NULL::public.transaction_status;
    RETURN;
  END IF;

  SELECT * INTO v_tx
  FROM public.transactions
  WHERE id = p_transaction_id AND type = 'withdrawal'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'NOT_FOUND', 'withdrawal transaction not found', NULL::uuid, NULL::public.transaction_status;
    RETURN;
  END IF;

  IF v_tx.status NOT IN ('withdraw_requested', 'withdraw_in_review', 'withdraw_approved') THEN
    RETURN QUERY SELECT FALSE, 'INVALID_STATE', 'withdrawal cannot be reviewed from current state', v_tx.id, v_tx.status;
    RETURN;
  END IF;

  SELECT * INTO v_wallet FROM public.wallets WHERE id = v_tx.wallet_id FOR UPDATE;
  SELECT * INTO v_profile FROM public.profiles WHERE id = v_tx.user_id FOR UPDATE;

  IF lower(trim(p_decision)) = 'approve' THEN
    UPDATE public.transactions
    SET status = 'withdraw_approved',
        reviewed_by = v_admin_id,
        reviewed_at = now(),
        review_reason = p_reason,
        updated_at = now()
    WHERE id = v_tx.id;

    INSERT INTO public.transaction_state_audit (
      transaction_id, user_id, from_status, to_status, actor_id, actor_type, idempotency_key, reason, payload
    ) VALUES (
      v_tx.id, v_tx.user_id, v_tx.status, 'withdraw_approved', v_admin_id, 'admin', p_admin_action_idempotency_key,
      COALESCE(p_reason, 'withdrawal approved'), jsonb_build_object('decision', 'approve')
    );

    INSERT INTO public.admin_actions (admin_id, action_type, target_user_id, target_table, old_value, new_value)
    VALUES (
      v_admin_id, 'withdraw_request_approved', v_tx.user_id, 'transactions',
      jsonb_build_object('status', v_tx.status),
      jsonb_build_object('transaction_id', v_tx.id, 'status', 'withdraw_approved', 'reason', p_reason)
    );

    RETURN QUERY SELECT TRUE, 'OK', 'withdrawal approved', v_tx.id, 'withdraw_approved'::public.transaction_status;
    RETURN;
  END IF;

  IF lower(trim(p_decision)) = 'reject' THEN
    UPDATE public.transactions
    SET status = 'withdraw_rejected',
        reviewed_by = v_admin_id,
        reviewed_at = now(),
        review_reason = p_reason,
        balance_delta = 0,
        updated_at = now()
    WHERE id = v_tx.id;

    UPDATE public.wallets
    SET available_balance = available_balance + v_tx.amount,
        locked_balance = GREATEST(locked_balance - v_tx.amount, 0),
        updated_at = now()
    WHERE id = v_wallet.id;

    UPDATE public.profiles
    SET account_balance = account_balance + v_tx.amount,
        updated_at = now()
    WHERE id = v_tx.user_id;

    INSERT INTO public.balance_history (
      user_id, admin_id, action_type, currency, amount, previous_balance, new_balance, reason
    ) VALUES (
      v_tx.user_id, v_admin_id, 'add', upper(v_tx.asset), v_tx.amount,
      v_profile.account_balance, v_profile.account_balance + v_tx.amount,
      COALESCE(p_reason, 'withdrawal rejected - funds returned')
    );

    INSERT INTO public.transaction_state_audit (
      transaction_id, user_id, from_status, to_status, actor_id, actor_type, idempotency_key, reason, payload
    ) VALUES (
      v_tx.id, v_tx.user_id, v_tx.status, 'withdraw_rejected', v_admin_id, 'admin', p_admin_action_idempotency_key,
      COALESCE(p_reason, 'withdrawal rejected'), jsonb_build_object('decision', 'reject')
    );

    INSERT INTO public.admin_actions (admin_id, action_type, target_user_id, target_table, old_value, new_value)
    VALUES (
      v_admin_id, 'withdraw_request_rejected', v_tx.user_id, 'transactions',
      jsonb_build_object('status', v_tx.status),
      jsonb_build_object('transaction_id', v_tx.id, 'status', 'withdraw_rejected', 'reason', p_reason)
    );

    RETURN QUERY SELECT TRUE, 'OK', 'withdrawal rejected', v_tx.id, 'withdraw_rejected'::public.transaction_status;
    RETURN;
  END IF;

  RETURN QUERY SELECT FALSE, 'INVALID_DECISION', 'decision must be approve or reject', v_tx.id, v_tx.status;
END;
$$;

CREATE OR REPLACE FUNCTION public.settle_withdrawal_callback(
  p_transaction_id uuid,
  p_callback_idempotency_key text,
  p_provider_status text,
  p_external_reference text DEFAULT NULL,
  p_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE(
  success boolean,
  code text,
  message text,
  transaction_id uuid,
  status public.transaction_status
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tx public.transactions%ROWTYPE;
  v_wallet public.wallets%ROWTYPE;
  v_profile public.profiles%ROWTYPE;
  v_norm text := lower(trim(COALESCE(p_provider_status, '')));
BEGIN
  IF p_transaction_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'INVALID_TRANSACTION', 'transaction id is required', NULL::uuid, NULL::public.transaction_status;
    RETURN;
  END IF;

  IF COALESCE(trim(p_callback_idempotency_key), '') = '' THEN
    RETURN QUERY SELECT FALSE, 'INVALID_IDEMPOTENCY_KEY', 'callback idempotency key is required', NULL::uuid, NULL::public.transaction_status;
    RETURN;
  END IF;

  SELECT * INTO v_tx FROM public.transactions WHERE callback_idempotency_key = p_callback_idempotency_key LIMIT 1;
  IF FOUND THEN
    RETURN QUERY SELECT TRUE, 'IDEMPOTENT_REPLAY', 'callback already processed', v_tx.id, v_tx.status;
    RETURN;
  END IF;

  SELECT * INTO v_tx
  FROM public.transactions
  WHERE id = p_transaction_id AND type = 'withdrawal'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'NOT_FOUND', 'withdrawal transaction not found', NULL::uuid, NULL::public.transaction_status;
    RETURN;
  END IF;

  SELECT * INTO v_wallet FROM public.wallets WHERE id = v_tx.wallet_id FOR UPDATE;
  SELECT * INTO v_profile FROM public.profiles WHERE id = v_tx.user_id FOR UPDATE;

  IF v_norm IN ('succeeded', 'success', 'completed') THEN
    UPDATE public.transactions
    SET status = 'withdraw_completed',
        callback_idempotency_key = p_callback_idempotency_key,
        external_reference = COALESCE(p_external_reference, external_reference),
        metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('provider_settlement', v_norm, 'provider_payload', COALESCE(p_payload, '{}'::jsonb)),
        updated_at = now()
    WHERE id = v_tx.id;

    UPDATE public.wallets
    SET balance = GREATEST(balance - v_tx.amount, 0),
        locked_balance = GREATEST(locked_balance - v_tx.amount, 0),
        updated_at = now()
    WHERE id = v_wallet.id;

    INSERT INTO public.transaction_state_audit (
      transaction_id, user_id, from_status, to_status, actor_type, idempotency_key, reason, payload
    ) VALUES (
      v_tx.id, v_tx.user_id, v_tx.status, 'withdraw_completed', 'provider', p_callback_idempotency_key,
      'withdraw settled by provider', COALESCE(p_payload, '{}'::jsonb)
    );

    RETURN QUERY SELECT TRUE, 'OK', 'withdrawal completed', v_tx.id, 'withdraw_completed'::public.transaction_status;
    RETURN;
  END IF;

  IF v_norm IN ('failed', 'rejected', 'reversed') THEN
    UPDATE public.transactions
    SET status = CASE WHEN v_norm = 'reversed' THEN 'cancelled'::public.transaction_status ELSE 'withdraw_failed'::public.transaction_status END,
        callback_idempotency_key = p_callback_idempotency_key,
        external_reference = COALESCE(p_external_reference, external_reference),
        metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('provider_settlement', v_norm, 'provider_payload', COALESCE(p_payload, '{}'::jsonb)),
        updated_at = now()
    WHERE id = v_tx.id;

    UPDATE public.wallets
    SET available_balance = available_balance + v_tx.amount,
        locked_balance = GREATEST(locked_balance - v_tx.amount, 0),
        updated_at = now()
    WHERE id = v_wallet.id;

    UPDATE public.profiles
    SET account_balance = account_balance + v_tx.amount,
        updated_at = now()
    WHERE id = v_tx.user_id;

    INSERT INTO public.balance_history (
      user_id, admin_id, action_type, currency, amount, previous_balance, new_balance, reason
    ) VALUES (
      v_tx.user_id, v_tx.user_id, 'add', upper(v_tx.asset), v_tx.amount,
      v_profile.account_balance, v_profile.account_balance + v_tx.amount,
      'withdraw callback failed/reversed funds returned'
    );

    INSERT INTO public.transaction_state_audit (
      transaction_id, user_id, from_status, to_status, actor_type, idempotency_key, reason, payload
    ) VALUES (
      v_tx.id, v_tx.user_id, v_tx.status,
      CASE WHEN v_norm = 'reversed' THEN 'cancelled'::public.transaction_status ELSE 'withdraw_failed'::public.transaction_status END,
      'provider', p_callback_idempotency_key,
      'withdraw callback failed/reversed', COALESCE(p_payload, '{}'::jsonb)
    );

    RETURN QUERY SELECT TRUE, 'OK', 'withdrawal rolled back', v_tx.id,
      CASE WHEN v_norm = 'reversed' THEN 'cancelled'::public.transaction_status ELSE 'withdraw_failed'::public.transaction_status END;
    RETURN;
  END IF;

  RETURN QUERY SELECT FALSE, 'INVALID_PROVIDER_STATUS', 'provider status must be succeeded/completed/failed/reversed', v_tx.id, v_tx.status;
END;
$$;

REVOKE ALL ON FUNCTION public.create_deposit_intent(text, numeric, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.request_withdrawal_review(text, text, numeric, numeric, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.confirm_deposit_callback(uuid, text, text, numeric, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.review_withdrawal_request(uuid, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.settle_withdrawal_callback(uuid, text, text, text, jsonb) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_deposit_intent(text, numeric, text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.request_withdrawal_review(text, text, numeric, numeric, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.confirm_deposit_callback(uuid, text, text, numeric, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.review_withdrawal_request(uuid, text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.settle_withdrawal_callback(uuid, text, text, text, jsonb) TO service_role;
