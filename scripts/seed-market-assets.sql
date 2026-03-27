-- Run in Supabase SQL Editor or via admin
-- Crypto (existing)
INSERT INTO assets (id, symbol, name, status) VALUES
('crypto-btc', 'BTC', 'Bitcoin', 'active'),
('crypto-eth', 'ETH', 'Ethereum', 'active')
ON CONFLICT (id) DO NOTHING;

-- Stocks
INSERT INTO assets (id, symbol, name, status) VALUES
('stock-aapl', 'AAPL', 'Apple Inc', 'active'),
('stock-tsla', 'TSLA', 'Tesla Inc', 'active'),
('stock-googl', 'GOOGL', 'Alphabet Inc', 'active'),
('stock-msft', 'MSFT', 'Microsoft', 'active'),
('stock-amzn', 'AMZN', 'Amazon', 'active'),
('stock-nvda', 'NVDA', 'NVIDIA', 'active')
ON CONFLICT (id) DO NOTHING;

-- Metals
INSERT INTO assets (id, symbol, name, status) VALUES
('metal-xau', 'XAU', 'Gold', 'active'),
('metal-xag', 'XAG', 'Silver', 'active'),
('metal-gld', 'GLD', 'SPDR Gold Shares', 'active');

-- Indices/Commodities
INSERT INTO assets (id, symbol, name, status) VALUES
('index-spy', 'SPY', 'S&P 500 ETF', 'active'),
('comm-usd', 'USO', 'Oil Fund', 'active'),
('forex-eurusd', 'EURUSD', 'EUR/USD', 'active')
ON CONFLICT (id) DO NOTHING;

-- Run ingest: supabase functions serve market-price-ingest --env-file ../.env.local
