-- Atomic order + withdrawal workflows via RPC

CREATE OR REPLACE FUNCTION public.create_order_atomic(
  p_side TEXT,
  p_asset TEXT,
  p_amount NUMERIC,
  p_price NUMERIC,
  p_total NUMERIC,
  p_order_type TEXT DEFAULT 'market'
)
RETURNS TABLE (
  success BOOLEAN,
  code TEXT,
  message TEXT,
  order_id TEXT,
  transaction_id TEXT,
  balance_before NUMERIC,
  balance_after NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_profile RECORD;
  v_order_id TEXT;
  v_tx_id TEXT;
  v_order_type TEXT;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'AUTH_REQUIRED', 'Authentication required', NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC;
    RETURN;
  END IF;

  IF p_side NOT IN ('buy', 'sell') THEN
    RETURN QUERY SELECT FALSE, 'INVALID_SIDE', 'side must be buy or sell', NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC;
    RETURN;
  END IF;

  IF p_asset IS NULL OR btrim(p_asset) = '' THEN
    RETURN QUERY SELECT FALSE, 'INVALID_ASSET', 'asset is required', NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC;
    RETURN;
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 OR p_total IS NULL OR p_total <= 0 THEN
    RETURN QUERY SELECT FALSE, 'INVALID_AMOUNT', 'amount and total must be greater than zero', NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC;
    RETURN;
  END IF;

  v_order_type := COALESCE(NULLIF(btrim(p_order_type), ''), 'market');

  SELECT id, account_balance
  INTO v_profile
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'PROFILE_NOT_FOUND', 'profile not found', NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC;
    RETURN;
  END IF;

  IF p_side = 'buy' AND v_profile.account_balance < p_total THEN
    RETURN QUERY SELECT FALSE, 'INSUFFICIENT_FUNDS', 'insufficient balance for buy order', NULL::TEXT, NULL::TEXT, v_profile.account_balance, v_profile.account_balance;
    RETURN;
  END IF;

  INSERT INTO public.orders (
    user_id,
    side,
    asset,
    amount,
    price,
    total,
    order_type,
    status,
    created_at
  )
  VALUES (
    v_user_id,
    p_side,
    p_asset,
    p_amount,
    p_price,
    p_total,
    v_order_type,
    'pending',
    NOW()
  )
  RETURNING id::TEXT INTO v_order_id;

  IF p_side = 'buy' THEN
    UPDATE public.profiles
    SET account_balance = account_balance - p_total,
        updated_at = NOW()
    WHERE id = v_user_id;

    INSERT INTO public.balance_history (
      user_id,
      action_type,
      amount,
      previous_balance,
      new_balance,
      reason,
      created_at
    )
    VALUES (
      v_user_id,
      'subtract',
      p_total,
      v_profile.account_balance,
      v_profile.account_balance - p_total,
      format('Order %s (%s)', v_order_id, p_side),
      NOW()
    );
  END IF;

  INSERT INTO public.transactions (
    user_id,
    type,
    asset,
    amount,
    value,
    status,
    date,
    created_at
  )
  VALUES (
    v_user_id,
    CASE WHEN p_side = 'buy' THEN 'order_buy' ELSE 'order_sell' END,
    p_asset,
    p_amount::TEXT,
    p_total::TEXT,
    'pending',
    to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'),
    NOW()
  )
  RETURNING id::TEXT INTO v_tx_id;

  RETURN QUERY
  SELECT
    TRUE,
    'OK',
    'order created',
    v_order_id,
    v_tx_id,
    v_profile.account_balance,
    CASE WHEN p_side = 'buy' THEN (v_profile.account_balance - p_total) ELSE v_profile.account_balance END;
END;
$$;


CREATE OR REPLACE FUNCTION public.request_withdrawal_atomic(
  p_currency TEXT,
  p_destination TEXT,
  p_amount NUMERIC,
  p_fee NUMERIC
)
RETURNS TABLE (
  success BOOLEAN,
  code TEXT,
  message TEXT,
  transaction_id TEXT,
  payout NUMERIC,
  balance_before NUMERIC,
  balance_after NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_profile RECORD;
  v_payout NUMERIC;
  v_tx_id TEXT;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'AUTH_REQUIRED', 'Authentication required', NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC;
    RETURN;
  END IF;

  IF p_currency IS NULL OR btrim(p_currency) = '' THEN
    RETURN QUERY SELECT FALSE, 'INVALID_CURRENCY', 'currency is required', NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC;
    RETURN;
  END IF;

  IF p_destination IS NULL OR btrim(p_destination) = '' THEN
    RETURN QUERY SELECT FALSE, 'INVALID_DESTINATION', 'destination is required', NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC;
    RETURN;
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN QUERY SELECT FALSE, 'INVALID_AMOUNT', 'amount must be greater than zero', NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC;
    RETURN;
  END IF;

  IF p_fee IS NULL OR p_fee < 0 THEN
    RETURN QUERY SELECT FALSE, 'INVALID_FEE', 'fee must be zero or greater', NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC;
    RETURN;
  END IF;

  v_payout := p_amount - p_fee;
  IF v_payout <= 0 THEN
    RETURN QUERY SELECT FALSE, 'INVALID_PAYOUT', 'amount must be greater than fee', NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC;
    RETURN;
  END IF;

  SELECT id, account_balance
  INTO v_profile
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'PROFILE_NOT_FOUND', 'profile not found', NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC;
    RETURN;
  END IF;

  IF v_profile.account_balance < p_amount THEN
    RETURN QUERY SELECT FALSE, 'INSUFFICIENT_FUNDS', 'insufficient balance', NULL::TEXT, v_payout, v_profile.account_balance, v_profile.account_balance;
    RETURN;
  END IF;

  UPDATE public.profiles
  SET account_balance = account_balance - p_amount,
      updated_at = NOW()
  WHERE id = v_user_id;

  INSERT INTO public.transactions (
    user_id,
    type,
    asset,
    amount,
    value,
    status,
    date,
    created_at
  )
  VALUES (
    v_user_id,
    'withdrawal',
    p_currency,
    p_amount::TEXT,
    v_payout::TEXT,
    'pending',
    to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'),
    NOW()
  )
  RETURNING id::TEXT INTO v_tx_id;

  INSERT INTO public.balance_history (
    user_id,
    action_type,
    amount,
    previous_balance,
    new_balance,
    reason,
    created_at
  )
  VALUES (
    v_user_id,
    'subtract',
    p_amount,
    v_profile.account_balance,
    v_profile.account_balance - p_amount,
    format('Withdrawal %s (%s)', v_tx_id, p_currency),
    NOW()
  );

  RETURN QUERY
  SELECT
    TRUE,
    'OK',
    'withdrawal requested',
    v_tx_id,
    v_payout,
    v_profile.account_balance,
    (v_profile.account_balance - p_amount);
END;
$$;

DO $$
BEGIN
  IF to_regclass('public.orders') IS NOT NULL THEN
    EXECUTE 'REVOKE INSERT, UPDATE, DELETE ON public.orders FROM anon, authenticated';
  END IF;

  IF to_regclass('public.transactions') IS NOT NULL THEN
    EXECUTE 'REVOKE INSERT, UPDATE, DELETE ON public.transactions FROM anon, authenticated';
  END IF;

  IF to_regclass('public.balance_history') IS NOT NULL THEN
    EXECUTE 'REVOKE INSERT, UPDATE, DELETE ON public.balance_history FROM anon, authenticated';
  END IF;

  IF to_regclass('public.profiles') IS NOT NULL THEN
    EXECUTE 'REVOKE UPDATE(account_balance) ON public.profiles FROM anon, authenticated';
  END IF;
END $$;

REVOKE ALL ON FUNCTION public.create_order_atomic(TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.request_withdrawal_atomic(TEXT, TEXT, NUMERIC, NUMERIC) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_order_atomic(TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.request_withdrawal_atomic(TEXT, TEXT, NUMERIC, NUMERIC) TO authenticated, service_role;
