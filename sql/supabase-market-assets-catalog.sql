-- Canonical market asset catalog extensions.
-- Adds explicit category/type and metadata payload for icons + static market stats.

alter table if exists public.assets
  add column if not exists category text not null default 'crypto',
  add column if not exists type text not null default 'spot',
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists idx_assets_category on public.assets (category);
create index if not exists idx_assets_status on public.assets (status);

-- Seed catalog metadata used by /api/market/list.
insert into public.assets (id, symbol, name, status, category, type, metadata)
values
  ('crypto-btc', 'BTC', 'Bitcoin', 'active', 'crypto', 'coin', '{"iconSrc":"/btc-logo.png","marketCap":842000000000,"volume24h":28400000000,"baselinePrice":43250}'::jsonb),
  ('crypto-eth', 'ETH', 'Ethereum', 'active', 'crypto', 'coin', '{"iconSrc":"/eth-logo.png","marketCap":274000000000,"volume24h":12100000000,"baselinePrice":2280.5}'::jsonb),
  ('crypto-bnb', 'BNB', 'Binance Coin', 'active', 'crypto', 'coin', '{"iconSrc":"/bnb-logo.png","marketCap":48200000000,"volume24h":1400000000,"baselinePrice":312.4}'::jsonb),
  ('crypto-sol', 'SOL', 'Solana', 'active', 'crypto', 'coin', '{"iconSrc":"/sol-logo.png","marketCap":42100000000,"volume24h":3800000000,"baselinePrice":98.75}'::jsonb),
  ('stock-aapl', 'AAPL', 'Apple Inc.', 'active', 'stocks', 'equity', '{"iconSrc":"https://logo.clearbit.com/apple.com","marketCap":2890000000000,"volume24h":52000000,"baselinePrice":185.92}'::jsonb),
  ('stock-msft', 'MSFT', 'Microsoft Corporation', 'active', 'stocks', 'equity', '{"iconSrc":"https://logo.clearbit.com/microsoft.com","marketCap":2810000000000,"volume24h":21000000,"baselinePrice":378.91}'::jsonb),
  ('stock-googl', 'GOOGL', 'Alphabet Inc.', 'active', 'stocks', 'equity', '{"iconSrc":"https://logo.clearbit.com/google.com","marketCap":1780000000000,"volume24h":18000000,"baselinePrice":141.8}'::jsonb),
  ('stock-amzn', 'AMZN', 'Amazon.com Inc.', 'active', 'stocks', 'equity', '{"iconSrc":"https://logo.clearbit.com/amazon.com","marketCap":1600000000000,"volume24h":35000000,"baselinePrice":155.34}'::jsonb),
  ('stock-tsla', 'TSLA', 'Tesla Inc.', 'active', 'stocks', 'equity', '{"iconSrc":"https://logo.clearbit.com/tesla.com","marketCap":790000000000,"volume24h":95000000,"baselinePrice":248.5}'::jsonb),
  ('stock-nvda', 'NVDA', 'NVIDIA Corporation', 'active', 'stocks', 'equity', '{"iconSrc":"https://logo.clearbit.com/nvidia.com","marketCap":1220000000000,"volume24h":42000000,"baselinePrice":495.22}'::jsonb),
  ('etf-spy', 'SPY', 'S&P 500 ETF', 'active', 'etfs', 'etf', '{"iconSrc":"https://logo.clearbit.com/spdrs.com","marketCap":4500000000,"volume24h":12000000,"baselinePrice":45.23}'::jsonb),
  ('etf-swda', 'SWDA', 'MSCI World ETF', 'active', 'etfs', 'etf', '{"iconSrc":"https://logo.clearbit.com/ishares.com","marketCap":3200000000,"volume24h":8500000,"baselinePrice":38.5}'::jsonb),
  ('etf-reet', 'REET', 'Global REITs ETF', 'active', 'etfs', 'etf', '{"iconSrc":"https://logo.clearbit.com/ishares.com","marketCap":450000000,"volume24h":3200000,"baselinePrice":22.15}'::jsonb),
  ('etf-gld', 'GLD', 'SPDR Gold Shares', 'active', 'etfs', 'etf', '{"iconSrc":"https://logo.clearbit.com/spdrs.com","marketCap":680000000,"volume24h":5600000,"baselinePrice":32.8}'::jsonb),
  ('metal-xau', 'XAU', 'Gold', 'active', 'metals', 'metal', '{"iconSrc":"https://assets.coingecko.com/coins/images/1043/small/Tether_Gold.png","marketCap":1200000000000,"volume24h":8500000000,"baselinePrice":2045.3}'::jsonb),
  ('metal-xag', 'XAG', 'Silver', 'active', 'metals', 'metal', '{"iconSrc":"https://assets.coingecko.com/coins/images/15180/small/silver.png","marketCap":33000000000,"volume24h":1200000000,"baselinePrice":23.45}'::jsonb),
  ('metal-xpd', 'XPD', 'Palladium', 'active', 'metals', 'metal', '{"iconSrc":"https://cdn.simpleicons.org/materialdesignicons/95a5a6","marketCap":24000000000,"volume24h":320000000,"baselinePrice":1025.8}'::jsonb),
  ('metal-xpt', 'XPT', 'Platinum', 'active', 'metals', 'metal', '{"iconSrc":"https://cdn.simpleicons.org/materialdesignicons/b8860b","marketCap":21000000000,"volume24h":280000000,"baselinePrice":985.6}'::jsonb),
  ('commodity-usoil', 'USOIL', 'Crude Oil', 'active', 'commodities', 'energy', '{"iconSrc":"https://cdn.simpleicons.org/oil/111111","marketCap":0,"volume24h":250000000,"baselinePrice":78.45}'::jsonb),
  ('commodity-natgas', 'NATGAS', 'Natural Gas', 'active', 'commodities', 'energy', '{"iconSrc":"https://cdn.simpleicons.org/letsencrypt/008000","marketCap":0,"volume24h":85000000,"baselinePrice":2.85}'::jsonb),
  ('commodity-copper', 'COPPER', 'Copper', 'active', 'commodities', 'metal', '{"iconSrc":"https://cdn.simpleicons.org/materialdesignicons/b87333","marketCap":0,"volume24h":45000000,"baselinePrice":3.85}'::jsonb),
  ('commodity-wheat', 'WHEAT', 'Wheat', 'active', 'commodities', 'agriculture', '{"iconSrc":"https://cdn.simpleicons.org/leaflet/27ae60","marketCap":0,"volume24h":18000000,"baselinePrice":612.5}'::jsonb)
on conflict (id) do update
set
  symbol = excluded.symbol,
  name = excluded.name,
  status = excluded.status,
  category = excluded.category,
  type = excluded.type,
  metadata = excluded.metadata;
