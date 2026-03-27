-- Market listing metadata + category normalization for API responses.

ALTER TABLE public.assets
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS type text,
  ADD COLUMN IF NOT EXISTS icon_src text,
  ADD COLUMN IF NOT EXISTS market_cap numeric(24,2),
  ADD COLUMN IF NOT EXISTS volume_24h numeric(24,2),
  ADD COLUMN IF NOT EXISTS baseline_price numeric(24,8),
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.assets
SET
  category = COALESCE(
    NULLIF(lower(category), ''),
    CASE
      WHEN lower(COALESCE(class_type, '')) IN ('crypto', 'stocks', 'etfs', 'metals', 'commodities', 'forex', 'indices') THEN lower(class_type)
      WHEN asset_type = 'stock'::public.asset_type THEN 'stocks'
      WHEN asset_type = 'etf'::public.asset_type THEN 'etfs'
      WHEN asset_type = 'index'::public.asset_type THEN 'indices'
      WHEN asset_type = 'commodity'::public.asset_type AND upper(symbol) IN ('XAU', 'XAG', 'XPT', 'XPD') THEN 'metals'
      WHEN asset_type = 'commodity'::public.asset_type THEN 'commodities'
      WHEN asset_type = 'fiat'::public.asset_type THEN 'forex'
      ELSE 'crypto'
    END
  ),
  type = COALESCE(NULLIF(type, ''), NULLIF(class_type, ''), asset_type::text, 'spot'),
  icon_src = COALESCE(icon_src, NULLIF(metadata->>'iconSrc', '')),
  market_cap = COALESCE(market_cap, NULLIF(metadata->>'marketCap', '')::numeric),
  volume_24h = COALESCE(volume_24h, NULLIF(metadata->>'volume24h', '')::numeric),
  baseline_price = COALESCE(baseline_price, NULLIF(metadata->>'baselinePrice', '')::numeric);

ALTER TABLE public.assets
  ALTER COLUMN category SET DEFAULT 'crypto',
  ALTER COLUMN type SET DEFAULT 'spot';

UPDATE public.assets
SET category = 'crypto'
WHERE category IS NULL;

UPDATE public.assets
SET type = 'spot'
WHERE type IS NULL;

ALTER TABLE public.assets
  ALTER COLUMN category SET NOT NULL,
  ALTER COLUMN type SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'assets_category_allowed_chk'
      AND conrelid = 'public.assets'::regclass
  ) THEN
    ALTER TABLE public.assets
      ADD CONSTRAINT assets_category_allowed_chk
      CHECK (category IN ('crypto', 'stocks', 'etfs', 'metals', 'commodities', 'forex', 'indices'));
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_assets_status_category_symbol
  ON public.assets(status, category, symbol);
