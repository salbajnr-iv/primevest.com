CREATE TABLE IF NOT EXISTS public.asset_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  asset TEXT NOT NULL,
  balance NUMERIC(24, 8) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, asset)
);

ALTER TABLE public.asset_balances ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'asset_balances' AND policyname = 'Users can view own asset balances'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view own asset balances" ON public.asset_balances FOR SELECT USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'asset_balances' AND policyname = 'Admins can view all asset balances'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can view all asset balances" ON public.asset_balances FOR SELECT USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin))';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.swap_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  transaction_id UUID,
  source_asset TEXT NOT NULL,
  destination_asset TEXT NOT NULL,
  source_amount NUMERIC(24, 8) NOT NULL CHECK (source_amount > 0),
  destination_amount NUMERIC(24, 8) NOT NULL CHECK (destination_amount > 0),
  quote_id TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.swap_orders ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'swap_orders' AND policyname = 'Users can view own swap orders'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view own swap orders" ON public.swap_orders FOR SELECT USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'swap_orders' AND policyname = 'Admins can view all swap orders'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can view all swap orders" ON public.swap_orders FOR SELECT USING (EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin))';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.execute_swap_atomic(
  p_source_asset TEXT,
  p_destination_asset TEXT,
  p_source_amount NUMERIC,
  p_destination_amount NUMERIC,
  p_quote_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS TABLE (
  success BOOLEAN,
  code TEXT,
  message TEXT,
  swap_id TEXT,
  transaction_id TEXT,
  source_balance_before NUMERIC,
  source_balance_after NUMERIC,
  destination_balance_before NUMERIC,
  destination_balance_after NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_profile RECORD;
  v_source_balance_before NUMERIC;
  v_destination_balance_before NUMERIC;
  v_swap_id UUID;
  v_tx_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'AUTH_REQUIRED', 'Authentication required', NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC;
    RETURN;
  END IF;

  IF p_source_asset IS NULL OR btrim(p_source_asset) = '' OR p_destination_asset IS NULL OR btrim(p_destination_asset) = '' THEN
    RETURN QUERY SELECT FALSE, 'INVALID_ASSET', 'source and destination assets are required', NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC;
    RETURN;
  END IF;

  IF upper(p_source_asset) = upper(p_destination_asset) THEN
    RETURN QUERY SELECT FALSE, 'INVALID_PAIR', 'source and destination assets must differ', NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC;
    RETURN;
  END IF;

  IF p_source_amount IS NULL OR p_source_amount <= 0 OR p_destination_amount IS NULL OR p_destination_amount <= 0 THEN
    RETURN QUERY SELECT FALSE, 'INVALID_AMOUNT', 'source and destination amounts must be greater than zero', NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC;
    RETURN;
  END IF;

  SELECT id, kyc_status
  INTO v_profile
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'PROFILE_NOT_FOUND', 'profile not found', NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC;
    RETURN;
  END IF;

  IF v_profile.kyc_status <> 'verified'::public.kyc_status THEN
    RETURN QUERY SELECT FALSE, 'KYC_REQUIRED', 'verified KYC is required for swaps', NULL::TEXT, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC;
    RETURN;
  END IF;

  INSERT INTO public.asset_balances (user_id, asset, balance)
  VALUES (v_user_id, upper(p_source_asset), 0)
  ON CONFLICT (user_id, asset) DO NOTHING;

  INSERT INTO public.asset_balances (user_id, asset, balance)
  VALUES (v_user_id, upper(p_destination_asset), 0)
  ON CONFLICT (user_id, asset) DO NOTHING;

  SELECT balance
    INTO v_source_balance_before
  FROM public.asset_balances
  WHERE user_id = v_user_id AND asset = upper(p_source_asset)
  FOR UPDATE;

  SELECT balance
    INTO v_destination_balance_before
  FROM public.asset_balances
  WHERE user_id = v_user_id AND asset = upper(p_destination_asset)
  FOR UPDATE;

  IF v_source_balance_before < p_source_amount THEN
    RETURN QUERY SELECT FALSE, 'INSUFFICIENT_FUNDS', 'insufficient source asset balance', NULL::TEXT, NULL::TEXT,
      v_source_balance_before, v_source_balance_before, v_destination_balance_before, v_destination_balance_before;
    RETURN;
  END IF;

  UPDATE public.asset_balances
  SET balance = balance - p_source_amount,
      updated_at = NOW()
  WHERE user_id = v_user_id AND asset = upper(p_source_asset);

  UPDATE public.asset_balances
  SET balance = balance + p_destination_amount,
      updated_at = NOW()
  WHERE user_id = v_user_id AND asset = upper(p_destination_asset);

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
    'swap',
    upper(p_source_asset) || '/' || upper(p_destination_asset),
    p_source_amount::TEXT,
    p_destination_amount::TEXT,
    'completed',
    to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'),
    NOW()
  )
  RETURNING id INTO v_tx_id;

  INSERT INTO public.swap_orders (
    user_id,
    transaction_id,
    source_asset,
    destination_asset,
    source_amount,
    destination_amount,
    quote_id,
    status,
    metadata,
    created_at
  )
  VALUES (
    v_user_id,
    v_tx_id,
    upper(p_source_asset),
    upper(p_destination_asset),
    p_source_amount,
    p_destination_amount,
    p_quote_id,
    'completed',
    COALESCE(p_metadata, '{}'::JSONB),
    NOW()
  )
  RETURNING id INTO v_swap_id;

  INSERT INTO public.orders (
    user_id,
    side,
    asset,
    amount,
    total,
    order_type,
    status,
    created_at
  )
  VALUES (
    v_user_id,
    'swap',
    upper(p_source_asset) || '/' || upper(p_destination_asset),
    p_source_amount,
    p_destination_amount,
    'swap',
    'completed',
    NOW()
  );

  PERFORM pg_notify(
    'swap_executed',
    json_build_object(
      'swap_id', v_swap_id,
      'transaction_id', v_tx_id,
      'user_id', v_user_id,
      'source_asset', upper(p_source_asset),
      'destination_asset', upper(p_destination_asset)
    )::TEXT
  );

  RETURN QUERY SELECT
    TRUE,
    'OK',
    'swap executed',
    v_swap_id::TEXT,
    v_tx_id::TEXT,
    v_source_balance_before,
    v_source_balance_before - p_source_amount,
    v_destination_balance_before,
    v_destination_balance_before + p_destination_amount;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

DO $$
BEGIN
  IF to_regclass('public.asset_balances') IS NOT NULL THEN
    EXECUTE 'REVOKE INSERT, UPDATE, DELETE ON public.asset_balances FROM anon, authenticated';
  END IF;

  IF to_regclass('public.swap_orders') IS NOT NULL THEN
    EXECUTE 'REVOKE INSERT, UPDATE, DELETE ON public.swap_orders FROM anon, authenticated';
  END IF;
END $$;

REVOKE ALL ON FUNCTION public.execute_swap_atomic(TEXT, TEXT, NUMERIC, NUMERIC, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.execute_swap_atomic(TEXT, TEXT, NUMERIC, NUMERIC, TEXT, JSONB) TO authenticated, service_role;
