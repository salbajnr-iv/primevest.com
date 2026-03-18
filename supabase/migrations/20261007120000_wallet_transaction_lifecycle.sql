-- Wallet transaction lifecycle states + idempotent intent/callback helpers.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'transaction_status'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public' AND t.typname = 'transaction_status' AND e.enumlabel = 'deposit_initiated'
    ) THEN
      ALTER TYPE public.transaction_status ADD VALUE 'deposit_initiated';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public' AND t.typname = 'transaction_status' AND e.enumlabel = 'deposit_confirmed'
    ) THEN
      ALTER TYPE public.transaction_status ADD VALUE 'deposit_confirmed';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public' AND t.typname = 'transaction_status' AND e.enumlabel = 'withdraw_requested'
    ) THEN
      ALTER TYPE public.transaction_status ADD VALUE 'withdraw_requested';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public' AND t.typname = 'transaction_status' AND e.enumlabel = 'withdraw_in_review'
    ) THEN
      ALTER TYPE public.transaction_status ADD VALUE 'withdraw_in_review';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public' AND t.typname = 'transaction_status' AND e.enumlabel = 'withdraw_approved'
    ) THEN
      ALTER TYPE public.transaction_status ADD VALUE 'withdraw_approved';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public' AND t.typname = 'transaction_status' AND e.enumlabel = 'withdraw_rejected'
    ) THEN
      ALTER TYPE public.transaction_status ADD VALUE 'withdraw_rejected';
    END IF;
  END IF;
END
$$;

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS idempotency_key text,
  ADD COLUMN IF NOT EXISTS callback_idempotency_key text,
  ADD COLUMN IF NOT EXISTS external_reference text,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS review_reason text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_idempotency_key
  ON public.transactions (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_callback_idempotency_key
  ON public.transactions (callback_idempotency_key)
  WHERE callback_idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_user_created_at
  ON public.transactions (user_id, created_at DESC);

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
BEGIN
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'UNAUTHENTICATED', 'authentication required', NULL::uuid, NULL::public.transaction_status;
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
    SELECT *
    INTO v_tx
    FROM public.transactions
    WHERE idempotency_key = p_idempotency_key
    LIMIT 1;

    IF FOUND THEN
      IF v_tx.user_id = v_user_id AND v_tx.type = 'deposit' THEN
        RETURN QUERY SELECT TRUE, 'IDEMPOTENT_REPLAY', 'deposit intent already exists', v_tx.id, v_tx.status;
      ELSE
        RETURN QUERY SELECT FALSE, 'IDEMPOTENCY_CONFLICT', 'idempotency key already used', NULL::uuid, NULL::public.transaction_status;
      END IF;
      RETURN;
    END IF;
  END IF;

  INSERT INTO public.transactions (
    user_id,
    asset,
    type,
    amount,
    fee_amount,
    total_amount,
    status,
    idempotency_key,
    external_reference,
    metadata
  ) VALUES (
    v_user_id,
    upper(p_currency),
    'deposit',
    p_amount,
    0,
    p_amount,
    'deposit_initiated',
    p_idempotency_key,
    p_external_reference,
    jsonb_build_object(
      'provider', p_provider,
      'lifecycle', 'initiated'
    )
  )
  RETURNING * INTO v_tx;

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
  v_payout numeric;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'UNAUTHENTICATED', 'authentication required', NULL::uuid, NULL::numeric, NULL::numeric, NULL::numeric;
    RETURN;
  END IF;

  SELECT *
  INTO v_profile
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'PROFILE_NOT_FOUND', 'profile not found', NULL::uuid, NULL::numeric, NULL::numeric, NULL::numeric;
    RETURN;
  END IF;

  IF v_profile.kyc_status <> 'verified' THEN
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
    SELECT *
    INTO v_tx
    FROM public.transactions
    WHERE idempotency_key = p_idempotency_key
    LIMIT 1;

    IF FOUND THEN
      IF v_tx.user_id = v_user_id AND v_tx.type = 'withdrawal' THEN
        RETURN QUERY SELECT TRUE, 'IDEMPOTENT_REPLAY', 'withdrawal request already exists', v_tx.id, ((v_tx.amount - COALESCE(v_tx.fee_amount, 0))::numeric), NULL::numeric, NULL::numeric;
      ELSE
        RETURN QUERY SELECT FALSE, 'IDEMPOTENCY_CONFLICT', 'idempotency key already used', NULL::uuid, NULL::numeric, v_profile.account_balance, v_profile.account_balance;
      END IF;
      RETURN;
    END IF;
  END IF;

  IF v_profile.account_balance < p_amount THEN
    RETURN QUERY SELECT FALSE, 'INSUFFICIENT_FUNDS', 'insufficient balance', NULL::uuid, v_payout, v_profile.account_balance, v_profile.account_balance;
    RETURN;
  END IF;

  UPDATE public.profiles
  SET account_balance = account_balance - p_amount,
      updated_at = now()
  WHERE id = v_user_id;

  INSERT INTO public.transactions (
    user_id,
    asset,
    type,
    amount,
    fee_amount,
    total_amount,
    status,
    idempotency_key,
    metadata
  ) VALUES (
    v_user_id,
    upper(p_currency),
    'withdrawal',
    p_amount,
    p_fee,
    v_payout,
    'withdraw_requested',
    p_idempotency_key,
    jsonb_build_object(
      'destination', p_destination,
      'lifecycle', 'requested'
    )
  )
  RETURNING * INTO v_tx;

  INSERT INTO public.balance_history (
    user_id,
    admin_id,
    action_type,
    currency,
    amount,
    previous_balance,
    new_balance,
    reason
  ) VALUES (
    v_user_id,
    v_user_id,
    'subtract',
    upper(p_currency),
    p_amount,
    v_profile.account_balance,
    v_profile.account_balance - p_amount,
    'withdrawal requested'
  );

  INSERT INTO public.admin_actions (
    admin_id,
    action_type,
    target_user_id,
    target_table,
    new_value
  ) VALUES (
    v_user_id,
    'withdraw_request_submitted',
    v_user_id,
    'transactions',
    jsonb_build_object(
      'transaction_id', v_tx.id,
      'status', v_tx.status,
      'amount', p_amount,
      'fee', p_fee,
      'destination', p_destination
    )
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

  SELECT *
  INTO v_tx
  FROM public.transactions
  WHERE callback_idempotency_key = p_callback_idempotency_key
  LIMIT 1;

  IF FOUND THEN
    SELECT * INTO v_profile FROM public.profiles WHERE id = v_tx.user_id;
    RETURN QUERY SELECT TRUE, 'IDEMPOTENT_REPLAY', 'callback already processed', v_tx.id, v_profile.account_balance, v_profile.account_balance;
    RETURN;
  END IF;

  SELECT *
  INTO v_tx
  FROM public.transactions
  WHERE id = p_transaction_id
    AND type = 'deposit'
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

  SELECT *
  INTO v_profile
  FROM public.profiles
  WHERE id = v_tx.user_id
  FOR UPDATE;

  UPDATE public.transactions
  SET status = 'deposit_confirmed',
      callback_idempotency_key = p_callback_idempotency_key,
      external_reference = COALESCE(p_external_reference, external_reference),
      total_amount = v_amount,
      metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
        'lifecycle', 'confirmed',
        'confirmed_at', now(),
        'callback_payload', COALESCE(p_payload, '{}'::jsonb)
      ),
      updated_at = now()
  WHERE id = v_tx.id;

  UPDATE public.profiles
  SET account_balance = account_balance + v_amount,
      updated_at = now()
  WHERE id = v_tx.user_id;

  INSERT INTO public.balance_history (
    user_id,
    admin_id,
    action_type,
    currency,
    amount,
    previous_balance,
    new_balance,
    reason
  ) VALUES (
    v_tx.user_id,
    v_tx.user_id,
    'add',
    upper(v_tx.asset),
    v_amount,
    v_profile.account_balance,
    v_profile.account_balance + v_amount,
    'deposit confirmed callback'
  );

  RETURN QUERY SELECT TRUE, 'OK', 'deposit confirmed', v_tx.id, v_profile.account_balance, v_profile.account_balance + v_amount;
END;
$$;

REVOKE ALL ON FUNCTION public.create_deposit_intent(text, numeric, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.request_withdrawal_review(text, text, numeric, numeric, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.confirm_deposit_callback(uuid, text, text, numeric, jsonb) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_deposit_intent(text, numeric, text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.request_withdrawal_review(text, text, numeric, numeric, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.confirm_deposit_callback(uuid, text, text, numeric, jsonb) TO service_role;
