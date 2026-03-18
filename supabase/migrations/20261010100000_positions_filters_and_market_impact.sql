-- Positions filtering/sorting performance and buy market impact RPC.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Speed up case-insensitive symbol/name search for positions filters.
CREATE INDEX IF NOT EXISTS idx_assets_symbol_trgm
  ON public.assets USING gin (lower(symbol) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_assets_name_trgm
  ON public.assets USING gin (lower(name) gin_trgm_ops);

-- Improve user-scoped sorting paths used by /api/positions.
CREATE INDEX IF NOT EXISTS idx_positions_user_market_value_desc
  ON public.positions (user_id, market_value DESC);

CREATE INDEX IF NOT EXISTS idx_positions_user_unrealized_pnl_desc
  ON public.positions (user_id, unrealized_pnl DESC);

CREATE OR REPLACE FUNCTION public.estimate_buy_market_impact(
  p_amount_eur numeric,
  p_liquidity_eur numeric DEFAULT 1000000,
  p_symbol text DEFAULT NULL
)
RETURNS TABLE (
  impact_pct numeric(8,4),
  severity text,
  classification text,
  warn_threshold numeric(8,4),
  confirmation_threshold numeric(8,4),
  block_threshold numeric(8,4)
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_amount numeric := GREATEST(COALESCE(p_amount_eur, 0), 0);
  v_liquidity numeric := GREATEST(COALESCE(p_liquidity_eur, 1000000), 1);
  v_ratio numeric;
  v_impact numeric;
BEGIN
  v_ratio := v_amount / v_liquidity;
  v_impact := LEAST(99, GREATEST(0, sqrt(v_ratio) * 100));

  IF v_impact >= 3 THEN
    severity := 'high';
  ELSIF v_impact >= 1 THEN
    severity := 'warn';
  ELSE
    severity := 'normal';
  END IF;

  IF v_impact >= 8 THEN
    classification := 'blocked';
  ELSIF v_impact >= 3 THEN
    classification := 'confirm_required';
  ELSIF v_impact >= 1 THEN
    classification := 'warn';
  ELSE
    classification := 'normal';
  END IF;

  impact_pct := ROUND(v_impact::numeric, 4);
  warn_threshold := 1;
  confirmation_threshold := 3;
  block_threshold := 8;

  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.estimate_buy_market_impact(numeric, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.estimate_buy_market_impact(numeric, numeric, text) TO service_role;
