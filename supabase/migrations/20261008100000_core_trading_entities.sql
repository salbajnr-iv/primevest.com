-- Core trading entities hardening: normalized columns, constraints, indexes, RLS,
-- and trade-fill reconciliation triggers.

-- 1) Enums for order type + transaction category.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_type') THEN
    CREATE TYPE public.order_type AS ENUM ('market', 'limit', 'stop', 'stop_limit');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_category') THEN
    CREATE TYPE public.transaction_category AS ENUM ('trade', 'deposit', 'withdraw', 'fee');
  END IF;
END
$$;

-- 2) Assets: minimum required metadata.
ALTER TABLE public.assets
  ADD COLUMN IF NOT EXISTS class_type text,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS reference_metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Map legacy status -> is_active when available.
UPDATE public.assets
SET is_active = (status = 'active'::public.asset_status)
WHERE status IS NOT NULL;

ALTER TABLE public.assets
  ALTER COLUMN symbol SET NOT NULL,
  ALTER COLUMN precision_scale SET NOT NULL,
  ADD CONSTRAINT assets_symbol_uppercase_chk CHECK (symbol = upper(symbol));

-- 3) Market prices: canonical fields.
ALTER TABLE public.market_prices
  ADD COLUMN IF NOT EXISTS price numeric(24,8),
  ADD COLUMN IF NOT EXISTS captured_at timestamptz;

UPDATE public.market_prices
SET price = COALESCE(price, last_price),
    captured_at = COALESCE(captured_at, priced_at, created_at)
WHERE price IS NULL OR captured_at IS NULL;

ALTER TABLE public.market_prices
  ALTER COLUMN asset_id SET NOT NULL,
  ALTER COLUMN price SET NOT NULL,
  ALTER COLUMN captured_at SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'market_prices_asset_source_captured_at_key'
      AND conrelid = 'public.market_prices'::regclass
  ) THEN
    ALTER TABLE public.market_prices
      ADD CONSTRAINT market_prices_asset_source_captured_at_key
      UNIQUE (asset_id, source, captured_at);
  END IF;
END
$$;

-- 4) Orders: normalize field names for trading workflows.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS asset_id uuid REFERENCES public.assets(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS order_type public.order_type NOT NULL DEFAULT 'market',
  ADD COLUMN IF NOT EXISTS qty numeric(24,8),
  ADD COLUMN IF NOT EXISTS limit_price numeric(24,8);

-- Backfill qty/limit_price from legacy columns if present.
UPDATE public.orders
SET qty = COALESCE(qty, quantity),
    limit_price = COALESCE(limit_price, price),
    asset_id = COALESCE(asset_id, a.id)
FROM public.assets a
WHERE a.symbol = orders.asset
  AND (orders.qty IS NULL OR orders.limit_price IS NULL OR orders.asset_id IS NULL);

ALTER TABLE public.orders
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN side SET NOT NULL,
  ALTER COLUMN qty SET NOT NULL,
  ADD CONSTRAINT orders_qty_positive_chk CHECK (qty > 0),
  ADD CONSTRAINT orders_limit_price_positive_chk CHECK (limit_price IS NULL OR limit_price > 0);

-- 5) Trades: normalized fill fields.
ALTER TABLE public.trades
  ADD COLUMN IF NOT EXISTS asset_id uuid REFERENCES public.assets(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS fill_qty numeric(24,8),
  ADD COLUMN IF NOT EXISTS fill_price numeric(24,8),
  ADD COLUMN IF NOT EXISTS fee numeric(24,8) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS filled_at timestamptz;

UPDATE public.trades
SET fill_qty = COALESCE(fill_qty, quantity),
    fill_price = COALESCE(fill_price, price),
    filled_at = COALESCE(filled_at, executed_at, created_at),
    asset_id = COALESCE(trades.asset_id, o.asset_id, a.id)
FROM public.orders o
LEFT JOIN public.assets a ON a.symbol = trades.asset
WHERE trades.order_id = o.id
  AND (
    trades.fill_qty IS NULL
    OR trades.fill_price IS NULL
    OR trades.filled_at IS NULL
    OR trades.asset_id IS NULL
  );

ALTER TABLE public.trades
  ALTER COLUMN order_id SET NOT NULL,
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN asset_id SET NOT NULL,
  ALTER COLUMN fill_qty SET NOT NULL,
  ALTER COLUMN fill_price SET NOT NULL,
  ALTER COLUMN filled_at SET NOT NULL,
  ADD CONSTRAINT trades_fill_qty_positive_chk CHECK (fill_qty > 0),
  ADD CONSTRAINT trades_fill_price_positive_chk CHECK (fill_price > 0),
  ADD CONSTRAINT trades_fee_non_negative_chk CHECK (fee >= 0);

-- 6) Positions: one row per user+asset with avg cost.
ALTER TABLE public.positions
  ADD COLUMN IF NOT EXISTS asset_id uuid REFERENCES public.assets(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS avg_cost numeric(24,8) NOT NULL DEFAULT 0;

UPDATE public.positions
SET asset_id = COALESCE(asset_id, a.id),
    avg_cost = COALESCE(avg_cost, avg_entry_price, 0)
FROM public.assets a
WHERE a.symbol = positions.asset
  AND (positions.asset_id IS NULL OR positions.avg_cost = 0);

ALTER TABLE public.positions
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN asset_id SET NOT NULL,
  ALTER COLUMN quantity SET NOT NULL,
  ADD CONSTRAINT positions_quantity_non_negative_chk CHECK (quantity >= 0),
  ADD CONSTRAINT positions_avg_cost_non_negative_chk CHECK (avg_cost >= 0);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'positions_user_asset_unique'
      AND conrelid = 'public.positions'::regclass
  ) THEN
    ALTER TABLE public.positions ADD CONSTRAINT positions_user_asset_unique UNIQUE (user_id, asset_id);
  END IF;
END
$$;

-- 7) Transactions: category + balance delta + references.
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS asset_id uuid REFERENCES public.assets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS category public.transaction_category,
  ADD COLUMN IF NOT EXISTS balance_delta numeric(24,8),
  ADD COLUMN IF NOT EXISTS refs jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.transactions t
SET asset_id = COALESCE(t.asset_id, o.asset_id, tr.asset_id, a.id),
    category = COALESCE(
      t.category,
      CASE
        WHEN t.type IN ('trade_buy'::public.transaction_type, 'trade_sell'::public.transaction_type) THEN 'trade'::public.transaction_category
        WHEN t.type = 'deposit'::public.transaction_type THEN 'deposit'::public.transaction_category
        WHEN t.type = 'withdrawal'::public.transaction_type THEN 'withdraw'::public.transaction_category
        WHEN t.type = 'fee'::public.transaction_type THEN 'fee'::public.transaction_category
        ELSE NULL
      END
    ),
    balance_delta = COALESCE(t.balance_delta, t.amount),
    refs = COALESCE(t.refs, '{}'::jsonb)
FROM public.orders o
LEFT JOIN public.trades tr ON tr.id = t.trade_id
LEFT JOIN public.assets a ON a.symbol = t.asset
WHERE t.order_id = o.id;

ALTER TABLE public.transactions
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN category SET NOT NULL,
  ALTER COLUMN amount SET NOT NULL,
  ALTER COLUMN balance_delta SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_trade_category_unique
  ON public.transactions(trade_id, category)
  WHERE trade_id IS NOT NULL AND category IN ('trade', 'fee');

-- 8) High-frequency lookup indexes.
CREATE INDEX IF NOT EXISTS idx_orders_user_status_created_at
  ON public.orders(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_asset_created_at
  ON public.orders(asset_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_trades_user_created_at
  ON public.trades(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trades_asset_created_at
  ON public.trades(asset_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_positions_user_asset
  ON public.positions(user_id, asset_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_category_created_at
  ON public.transactions(user_id, category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_asset_created_at
  ON public.transactions(asset_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_market_prices_asset_captured_at
  ON public.market_prices(asset_id, captured_at DESC);

-- 9) RLS policies: owner records + admin override.
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS assets_read_all_authenticated ON public.assets;
CREATE POLICY assets_read_all_authenticated ON public.assets
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS assets_admin_manage_all ON public.assets;
CREATE POLICY assets_admin_manage_all ON public.assets
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS market_prices_read_all_authenticated ON public.market_prices;
CREATE POLICY market_prices_read_all_authenticated ON public.market_prices
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS market_prices_admin_manage_all ON public.market_prices;
CREATE POLICY market_prices_admin_manage_all ON public.market_prices
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS orders_owner_or_admin_all_v2 ON public.orders;
CREATE POLICY orders_owner_or_admin_all_v2 ON public.orders
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
  WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS trades_owner_or_admin_all_v2 ON public.trades;
CREATE POLICY trades_owner_or_admin_all_v2 ON public.trades
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
  WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS positions_owner_or_admin_all_v2 ON public.positions;
CREATE POLICY positions_owner_or_admin_all_v2 ON public.positions
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
  WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS transactions_owner_or_admin_all_v2 ON public.transactions;
CREATE POLICY transactions_owner_or_admin_all_v2 ON public.transactions
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
  WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- 10) Trigger functions for trade-fill position update + balance reconciliation.
CREATE OR REPLACE FUNCTION public.apply_trade_fill_reconciliation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_side public.order_side;
  v_signed_qty numeric(24,8);
  v_existing_qty numeric(24,8);
  v_existing_avg numeric(24,8);
  v_new_qty numeric(24,8);
  v_new_avg numeric(24,8);
BEGIN
  SELECT o.side INTO v_side
  FROM public.orders o
  WHERE o.id = NEW.order_id;

  IF v_side IS NULL THEN
    RAISE EXCEPTION 'Order % missing or has no side', NEW.order_id;
  END IF;

  v_signed_qty := CASE WHEN v_side = 'buy' THEN NEW.fill_qty ELSE -NEW.fill_qty END;

  INSERT INTO public.positions (user_id, asset_id, quantity, avg_cost, updated_at)
  VALUES (
    NEW.user_id,
    NEW.asset_id,
    GREATEST(v_signed_qty, 0),
    CASE WHEN v_signed_qty > 0 THEN NEW.fill_price ELSE 0 END,
    now()
  )
  ON CONFLICT (user_id, asset_id)
  DO UPDATE
    SET quantity = CASE
      WHEN v_side = 'buy' THEN
        positions.quantity + EXCLUDED.quantity
      ELSE
        GREATEST(positions.quantity - NEW.fill_qty, 0)
      END,
      avg_cost = CASE
        WHEN v_side = 'buy' THEN
          CASE
            WHEN (positions.quantity + EXCLUDED.quantity) > 0 THEN
              ((positions.quantity * positions.avg_cost) + (NEW.fill_qty * NEW.fill_price))
              / (positions.quantity + EXCLUDED.quantity)
            ELSE 0
          END
        ELSE
          positions.avg_cost
      END,
      updated_at = now();

  -- Transaction for asset quantity movement on trade fill.
  INSERT INTO public.transactions (
    user_id,
    order_id,
    trade_id,
    asset_id,
    category,
    amount,
    balance_delta,
    refs,
    status,
    created_at,
    updated_at
  ) VALUES (
    NEW.user_id,
    NEW.order_id,
    NEW.id,
    NEW.asset_id,
    'trade',
    NEW.fill_qty,
    v_signed_qty,
    jsonb_build_object('order_side', v_side::text, 'filled_at', NEW.filled_at),
    'completed',
    now(),
    now()
  )
  ON CONFLICT (trade_id, category) WHERE category = 'trade'
  DO UPDATE SET
    amount = EXCLUDED.amount,
    balance_delta = EXCLUDED.balance_delta,
    refs = EXCLUDED.refs,
    updated_at = now();

  -- Fee transaction entry on filled trade.
  IF NEW.fee > 0 THEN
    INSERT INTO public.transactions (
      user_id,
      order_id,
      trade_id,
      asset_id,
      category,
      amount,
      balance_delta,
      refs,
      status,
      created_at,
      updated_at
    ) VALUES (
      NEW.user_id,
      NEW.order_id,
      NEW.id,
      NEW.asset_id,
      'fee',
      NEW.fee,
      -NEW.fee,
      jsonb_build_object('order_side', v_side::text, 'filled_at', NEW.filled_at),
      'completed',
      now(),
      now()
    )
    ON CONFLICT (trade_id, category) WHERE category = 'fee'
    DO UPDATE SET
      amount = EXCLUDED.amount,
      balance_delta = EXCLUDED.balance_delta,
      refs = EXCLUDED.refs,
      updated_at = now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_apply_trade_fill_reconciliation ON public.trades;
CREATE TRIGGER trg_apply_trade_fill_reconciliation
AFTER INSERT OR UPDATE OF fill_qty, fill_price, fee, filled_at
ON public.trades
FOR EACH ROW
WHEN (NEW.status = 'settled')
EXECUTE FUNCTION public.apply_trade_fill_reconciliation();
