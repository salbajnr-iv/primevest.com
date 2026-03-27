-- Normalize market listing category/type and add metadata fields consumed by /api/market/list.

ALTER TABLE public.assets
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS listing_type text,
  ADD COLUMN IF NOT EXISTS icon_src text,
  ADD COLUMN IF NOT EXISTS market_cap numeric(24,2),
  ADD COLUMN IF NOT EXISTS volume_24h numeric(24,2),
  ADD COLUMN IF NOT EXISTS baseline_price_eur numeric(24,8);

UPDATE public.assets
SET category = COALESCE(
  NULLIF(lower(trim(category)), ''),
  CASE
    WHEN lower(asset_type::text) = 'stock' THEN 'stocks'
    WHEN lower(asset_type::text) = 'etf' THEN 'etfs'
    WHEN lower(asset_type::text) = 'index' THEN 'indices'
    WHEN lower(asset_type::text) = 'fiat' THEN 'forex'
    WHEN lower(asset_type::text) = 'commodity' AND lower(COALESCE(class_type, '')) = 'metals' THEN 'metals'
    WHEN lower(asset_type::text) = 'commodity' THEN 'commodities'
    ELSE 'crypto'
  END
);

UPDATE public.assets
SET listing_type = COALESCE(
  NULLIF(lower(trim(listing_type)), ''),
  CASE
    WHEN lower(asset_type::text) = 'fiat' THEN 'pair'
    WHEN lower(asset_type::text) IN ('stock', 'etf', 'index') THEN 'cfd'
    ELSE 'spot'
  END
);

ALTER TABLE public.assets
  ALTER COLUMN category SET DEFAULT 'crypto',
  ALTER COLUMN listing_type SET DEFAULT 'spot';

UPDATE public.assets
SET category = 'crypto'
WHERE category IS NULL;

UPDATE public.assets
SET listing_type = 'spot'
WHERE listing_type IS NULL;

ALTER TABLE public.assets
  ALTER COLUMN category SET NOT NULL,
  ALTER COLUMN listing_type SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assets_category_allowed_chk') THEN
    ALTER TABLE public.assets
      ADD CONSTRAINT assets_category_allowed_chk
      CHECK (category IN ('crypto', 'stocks', 'etfs', 'metals', 'commodities', 'forex', 'indices'));
  END IF;
END
$$;
