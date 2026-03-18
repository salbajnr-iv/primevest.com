-- One-off reconciliation script for legacy column names in production.
-- Safe to run multiple times.

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

SELECT public.reconcile_column_name('public', 'orders', 'total', 'total_amount');
SELECT public.reconcile_column_name('public', 'trades', 'total', 'total_amount');
SELECT public.reconcile_column_name('public', 'transactions', 'total', 'total_amount');
SELECT public.reconcile_column_name('public', 'transactions', 'fee', 'fee_amount');
SELECT public.reconcile_column_name('public', 'orders', 'asset_symbol', 'asset');
SELECT public.reconcile_column_name('public', 'wallets', 'currency', 'asset');
SELECT public.reconcile_column_name('public', 'positions', 'symbol', 'asset');
SELECT public.reconcile_column_name('public', 'market_prices', 'symbol', 'asset');
SELECT public.reconcile_column_name('public', 'market_prices', 'price', 'last_price');

DROP FUNCTION IF EXISTS public.reconcile_column_name(text, text, text, text);
