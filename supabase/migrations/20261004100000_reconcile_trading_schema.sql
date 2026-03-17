-- Reconcile/define trading domain tables with explicit constraints, indexes, and RLS.
-- Safe for production environments where tables/columns may already exist.

-- 1) Enum types (create only when missing)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE public.order_status AS ENUM ('pending', 'open', 'partial', 'filled', 'cancelled', 'rejected', 'expired');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trade_status') THEN
    CREATE TYPE public.trade_status AS ENUM ('pending', 'settled', 'failed', 'cancelled');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'position_status') THEN
    CREATE TYPE public.position_status AS ENUM ('open', 'closed', 'liquidated');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wallet_status') THEN
    CREATE TYPE public.wallet_status AS ENUM ('active', 'frozen', 'closed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
    CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
    CREATE TYPE public.transaction_type AS ENUM ('deposit', 'withdrawal', 'trade_buy', 'trade_sell', 'fee', 'adjustment', 'transfer');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'asset_status') THEN
    CREATE TYPE public.asset_status AS ENUM ('active', 'inactive', 'delisted');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'asset_type') THEN
    CREATE TYPE public.asset_type AS ENUM ('crypto', 'fiat', 'stock', 'commodity', 'etf', 'index');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'price_status') THEN
    CREATE TYPE public.price_status AS ENUM ('live', 'delayed', 'stale');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_side') THEN
    CREATE TYPE public.order_side AS ENUM ('buy', 'sell');
  END IF;
END
$$;

-- 2) Migration-safe column name reconciliation utility.
CREATE OR REPLACE FUNCTION public.reconcile_column_name(p_schema text, p_table text, p_old text, p_new text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = p_schema
      AND table_name = p_table
      AND column_name = p_old
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = p_schema
      AND table_name = p_table
      AND column_name = p_new
  ) THEN
    EXECUTE format('ALTER TABLE %I.%I RENAME COLUMN %I TO %I', p_schema, p_table, p_old, p_new);
  END IF;
END;
$$;

-- 3) Create tables if missing.
CREATE TABLE IF NOT EXISTS public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL UNIQUE,
  name text NOT NULL,
  asset_type public.asset_type NOT NULL DEFAULT 'crypto',
  status public.asset_status NOT NULL DEFAULT 'active',
  precision_scale smallint NOT NULL DEFAULT 8 CHECK (precision_scale BETWEEN 0 AND 18),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset text NOT NULL,
  balance numeric(24,8) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  available_balance numeric(24,8) NOT NULL DEFAULT 0 CHECK (available_balance >= 0),
  locked_balance numeric(24,8) NOT NULL DEFAULT 0 CHECK (locked_balance >= 0),
  status public.wallet_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, asset)
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset text NOT NULL,
  side public.order_side NOT NULL,
  quantity numeric(24,8) NOT NULL CHECK (quantity > 0),
  price numeric(24,8) NOT NULL CHECK (price > 0),
  total_amount numeric(24,8) NOT NULL CHECK (total_amount >= 0),
  status public.order_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  asset text NOT NULL,
  side public.order_side NOT NULL,
  quantity numeric(24,8) NOT NULL CHECK (quantity > 0),
  price numeric(24,8) NOT NULL CHECK (price > 0),
  total_amount numeric(24,8) NOT NULL CHECK (total_amount >= 0),
  status public.trade_status NOT NULL DEFAULT 'pending',
  executed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset text NOT NULL,
  quantity numeric(24,8) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  avg_entry_price numeric(24,8) NOT NULL DEFAULT 0 CHECK (avg_entry_price >= 0),
  market_value numeric(24,8) NOT NULL DEFAULT 0 CHECK (market_value >= 0),
  unrealized_pnl numeric(24,8) NOT NULL DEFAULT 0,
  status public.position_status NOT NULL DEFAULT 'open',
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, asset)
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id uuid REFERENCES public.wallets(id) ON DELETE SET NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  trade_id uuid REFERENCES public.trades(id) ON DELETE SET NULL,
  asset text NOT NULL,
  type public.transaction_type NOT NULL,
  amount numeric(24,8) NOT NULL CHECK (amount >= 0),
  fee_amount numeric(24,8) NOT NULL DEFAULT 0 CHECK (fee_amount >= 0),
  total_amount numeric(24,8) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  status public.transaction_status NOT NULL DEFAULT 'pending',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.market_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES public.assets(id) ON DELETE CASCADE,
  asset text NOT NULL,
  last_price numeric(24,8) NOT NULL CHECK (last_price >= 0),
  source text NOT NULL DEFAULT 'internal',
  status public.price_status NOT NULL DEFAULT 'live',
  priced_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (asset, source, priced_at)
);

-- 4) Reconcile likely production column mismatches.
SELECT public.reconcile_column_name('public', 'orders', 'total', 'total_amount');
SELECT public.reconcile_column_name('public', 'trades', 'total', 'total_amount');
SELECT public.reconcile_column_name('public', 'transactions', 'total', 'total_amount');
SELECT public.reconcile_column_name('public', 'transactions', 'fee', 'fee_amount');
SELECT public.reconcile_column_name('public', 'orders', 'asset_symbol', 'asset');
SELECT public.reconcile_column_name('public', 'wallets', 'currency', 'asset');
SELECT public.reconcile_column_name('public', 'positions', 'symbol', 'asset');
SELECT public.reconcile_column_name('public', 'market_prices', 'symbol', 'asset');
SELECT public.reconcile_column_name('public', 'market_prices', 'price', 'last_price');

-- 5) Ensure required columns, constraints, and enum-backed status types on pre-existing tables.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS asset text,
  ADD COLUMN IF NOT EXISTS side public.order_side DEFAULT 'buy',
  ADD COLUMN IF NOT EXISTS quantity numeric(24,8) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS price numeric(24,8) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_amount numeric(24,8) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status public.order_status DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.trades
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS asset text,
  ADD COLUMN IF NOT EXISTS side public.order_side DEFAULT 'buy',
  ADD COLUMN IF NOT EXISTS quantity numeric(24,8) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS price numeric(24,8) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_amount numeric(24,8) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status public.trade_status DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS executed_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.positions
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS asset text,
  ADD COLUMN IF NOT EXISTS quantity numeric(24,8) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_entry_price numeric(24,8) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS market_value numeric(24,8) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unrealized_pnl numeric(24,8) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status public.position_status DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS opened_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS closed_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.wallets
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS asset text,
  ADD COLUMN IF NOT EXISTS balance numeric(24,8) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS available_balance numeric(24,8) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_balance numeric(24,8) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status public.wallet_status DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS wallet_id uuid REFERENCES public.wallets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS trade_id uuid REFERENCES public.trades(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS asset text,
  ADD COLUMN IF NOT EXISTS type public.transaction_type DEFAULT 'transfer',
  ADD COLUMN IF NOT EXISTS amount numeric(24,8) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fee_amount numeric(24,8) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_amount numeric(24,8) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status public.transaction_status DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.assets
  ADD COLUMN IF NOT EXISTS symbol text,
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS asset_type public.asset_type DEFAULT 'crypto',
  ADD COLUMN IF NOT EXISTS status public.asset_status DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS precision_scale smallint DEFAULT 8,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.market_prices
  ADD COLUMN IF NOT EXISTS asset_id uuid REFERENCES public.assets(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS asset text,
  ADD COLUMN IF NOT EXISTS last_price numeric(24,8) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'internal',
  ADD COLUMN IF NOT EXISTS status public.price_status DEFAULT 'live',
  ADD COLUMN IF NOT EXISTS priced_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Ensure primary keys exist on legacy tables.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.orders'::regclass
      AND contype = 'p'
  ) THEN
    ALTER TABLE public.orders ADD PRIMARY KEY (id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.trades'::regclass
      AND contype = 'p'
  ) THEN
    ALTER TABLE public.trades ADD PRIMARY KEY (id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.positions'::regclass
      AND contype = 'p'
  ) THEN
    ALTER TABLE public.positions ADD PRIMARY KEY (id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.wallets'::regclass
      AND contype = 'p'
  ) THEN
    ALTER TABLE public.wallets ADD PRIMARY KEY (id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.transactions'::regclass
      AND contype = 'p'
  ) THEN
    ALTER TABLE public.transactions ADD PRIMARY KEY (id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.assets'::regclass
      AND contype = 'p'
  ) THEN
    ALTER TABLE public.assets ADD PRIMARY KEY (id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.market_prices'::regclass
      AND contype = 'p'
  ) THEN
    ALTER TABLE public.market_prices ADD PRIMARY KEY (id);
  END IF;
END
$$;

-- 6) Normalize legacy text status columns to enum types where needed.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'status' AND udt_name <> 'order_status'
  ) THEN
    ALTER TABLE public.orders
      ALTER COLUMN status TYPE public.order_status
      USING CASE lower(status::text)
        WHEN 'pending' THEN 'pending'::public.order_status
        WHEN 'open' THEN 'open'::public.order_status
        WHEN 'partial' THEN 'partial'::public.order_status
        WHEN 'filled' THEN 'filled'::public.order_status
        WHEN 'cancelled' THEN 'cancelled'::public.order_status
        WHEN 'rejected' THEN 'rejected'::public.order_status
        WHEN 'expired' THEN 'expired'::public.order_status
        ELSE 'pending'::public.order_status
      END;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'trades' AND column_name = 'status' AND udt_name <> 'trade_status'
  ) THEN
    ALTER TABLE public.trades
      ALTER COLUMN status TYPE public.trade_status
      USING CASE lower(status::text)
        WHEN 'pending' THEN 'pending'::public.trade_status
        WHEN 'settled' THEN 'settled'::public.trade_status
        WHEN 'failed' THEN 'failed'::public.trade_status
        WHEN 'cancelled' THEN 'cancelled'::public.trade_status
        ELSE 'pending'::public.trade_status
      END;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'positions' AND column_name = 'status' AND udt_name <> 'position_status'
  ) THEN
    ALTER TABLE public.positions
      ALTER COLUMN status TYPE public.position_status
      USING CASE lower(status::text)
        WHEN 'open' THEN 'open'::public.position_status
        WHEN 'closed' THEN 'closed'::public.position_status
        WHEN 'liquidated' THEN 'liquidated'::public.position_status
        ELSE 'open'::public.position_status
      END;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'wallets' AND column_name = 'status' AND udt_name <> 'wallet_status'
  ) THEN
    ALTER TABLE public.wallets
      ALTER COLUMN status TYPE public.wallet_status
      USING CASE lower(status::text)
        WHEN 'active' THEN 'active'::public.wallet_status
        WHEN 'frozen' THEN 'frozen'::public.wallet_status
        WHEN 'closed' THEN 'closed'::public.wallet_status
        ELSE 'active'::public.wallet_status
      END;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'status' AND udt_name <> 'transaction_status'
  ) THEN
    ALTER TABLE public.transactions
      ALTER COLUMN status TYPE public.transaction_status
      USING CASE lower(status::text)
        WHEN 'pending' THEN 'pending'::public.transaction_status
        WHEN 'completed' THEN 'completed'::public.transaction_status
        WHEN 'failed' THEN 'failed'::public.transaction_status
        WHEN 'cancelled' THEN 'cancelled'::public.transaction_status
        ELSE 'pending'::public.transaction_status
      END;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'status' AND udt_name <> 'asset_status'
  ) THEN
    ALTER TABLE public.assets
      ALTER COLUMN status TYPE public.asset_status
      USING CASE lower(status::text)
        WHEN 'active' THEN 'active'::public.asset_status
        WHEN 'inactive' THEN 'inactive'::public.asset_status
        WHEN 'delisted' THEN 'delisted'::public.asset_status
        ELSE 'active'::public.asset_status
      END;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'market_prices' AND column_name = 'status' AND udt_name <> 'price_status'
  ) THEN
    ALTER TABLE public.market_prices
      ALTER COLUMN status TYPE public.price_status
      USING CASE lower(status::text)
        WHEN 'live' THEN 'live'::public.price_status
        WHEN 'delayed' THEN 'delayed'::public.price_status
        WHEN 'stale' THEN 'stale'::public.price_status
        ELSE 'live'::public.price_status
      END;
  END IF;
END $$;

-- 7) Precision and data integrity constraints (idempotent-style add via named constraints).
ALTER TABLE public.orders
  ALTER COLUMN quantity SET NOT NULL,
  ALTER COLUMN price SET NOT NULL,
  ALTER COLUMN total_amount SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE public.trades
  ALTER COLUMN quantity SET NOT NULL,
  ALTER COLUMN price SET NOT NULL,
  ALTER COLUMN total_amount SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE public.positions
  ALTER COLUMN quantity SET NOT NULL,
  ALTER COLUMN avg_entry_price SET NOT NULL,
  ALTER COLUMN market_value SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE public.wallets
  ALTER COLUMN balance SET NOT NULL,
  ALTER COLUMN available_balance SET NOT NULL,
  ALTER COLUMN locked_balance SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE public.transactions
  ALTER COLUMN amount SET NOT NULL,
  ALTER COLUMN fee_amount SET NOT NULL,
  ALTER COLUMN total_amount SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE public.assets
  ALTER COLUMN precision_scale SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE public.market_prices
  ALTER COLUMN last_price SET NOT NULL,
  ALTER COLUMN priced_at SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_quantity_positive') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_quantity_positive CHECK (quantity > 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_price_positive') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_price_positive CHECK (price > 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trades_quantity_positive') THEN
    ALTER TABLE public.trades ADD CONSTRAINT trades_quantity_positive CHECK (quantity > 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trades_price_positive') THEN
    ALTER TABLE public.trades ADD CONSTRAINT trades_price_positive CHECK (price > 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wallets_balances_non_negative') THEN
    ALTER TABLE public.wallets ADD CONSTRAINT wallets_balances_non_negative CHECK (
      balance >= 0 AND available_balance >= 0 AND locked_balance >= 0
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assets_precision_scale_range') THEN
    ALTER TABLE public.assets ADD CONSTRAINT assets_precision_scale_range CHECK (precision_scale BETWEEN 0 AND 18);
  END IF;
END
$$;

-- 8) Indexes requested for user_id / asset / status / created_at.
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_asset ON public.orders(asset);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_trades_user_id ON public.trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_asset ON public.trades(asset);
CREATE INDEX IF NOT EXISTS idx_trades_status ON public.trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON public.trades(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_positions_user_id ON public.positions(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_asset ON public.positions(asset);
CREATE INDEX IF NOT EXISTS idx_positions_status ON public.positions(status);
CREATE INDEX IF NOT EXISTS idx_positions_created_at ON public.positions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_asset ON public.wallets(asset);
CREATE INDEX IF NOT EXISTS idx_wallets_status ON public.wallets(status);
CREATE INDEX IF NOT EXISTS idx_wallets_created_at ON public.wallets(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_asset ON public.transactions(asset);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON public.assets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assets_symbol ON public.assets(symbol);

CREATE INDEX IF NOT EXISTS idx_market_prices_asset ON public.market_prices(asset);
CREATE INDEX IF NOT EXISTS idx_market_prices_status ON public.market_prices(status);
CREATE INDEX IF NOT EXISTS idx_market_prices_created_at ON public.market_prices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_prices_priced_at ON public.market_prices(priced_at DESC);

-- 9) RLS: owner access + admin override for user-owned tables.
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS orders_owner_or_admin_all ON public.orders;
CREATE POLICY orders_owner_or_admin_all ON public.orders
  FOR ALL
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  )
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS trades_owner_or_admin_all ON public.trades;
CREATE POLICY trades_owner_or_admin_all ON public.trades
  FOR ALL
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  )
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS positions_owner_or_admin_all ON public.positions;
CREATE POLICY positions_owner_or_admin_all ON public.positions
  FOR ALL
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  )
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS wallets_owner_or_admin_all ON public.wallets;
CREATE POLICY wallets_owner_or_admin_all ON public.wallets
  FOR ALL
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  )
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS transactions_owner_or_admin_all ON public.transactions;
CREATE POLICY transactions_owner_or_admin_all ON public.transactions
  FOR ALL
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  )
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- Reference tables: authenticated read, admin write override.
DROP POLICY IF EXISTS assets_read_authenticated ON public.assets;
CREATE POLICY assets_read_authenticated ON public.assets
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS assets_admin_manage ON public.assets;
CREATE POLICY assets_admin_manage ON public.assets
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS market_prices_read_authenticated ON public.market_prices;
CREATE POLICY market_prices_read_authenticated ON public.market_prices
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS market_prices_admin_manage ON public.market_prices;
CREATE POLICY market_prices_admin_manage ON public.market_prices
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- 10) Cleanup helper function used for reconciliation.
DROP FUNCTION IF EXISTS public.reconcile_column_name(text, text, text, text);
