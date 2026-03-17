# Supabase Edge Functions

This directory contains server-only operations for payment callbacks and admin workflows.

## Security model

- `SUPABASE_SERVICE_ROLE_KEY` is loaded only at runtime inside edge functions.
- Do not import anything from this folder into browser/client paths.
- Admin workflows verify `Authorization: Bearer <jwt>` and require `profiles.is_admin = true`.

## Functions

- `payment-webhook`
- `admin-kyc-decision`
- `admin-balance-adjustment`
- `market-price-ingest` (scheduled/manual ingestion from CoinGecko into `market_prices` + `asset_snapshots`)
