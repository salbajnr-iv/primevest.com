# Supabase Edge Functions

This directory contains server-only operations for payment callbacks, provider callbacks, and admin workflows.

## Security model

- `SUPABASE_SERVICE_ROLE_KEY` is loaded only at runtime inside edge functions.
- Do not import anything from this folder into browser/client paths.
- Admin workflows verify `Authorization: Bearer <jwt>` and require `profiles.is_admin = true`.
- Async callbacks and maintenance jobs use replay keys (`async_task_replays`) before applying side effects.

## Functions

- `payment-webhook`
- `kyc-provider-callback`
- `admin-kyc-decision`
- `admin-balance-adjustment`
- `admin-maintenance-batch`
- `market-price-ingest` (scheduled/manual ingestion from CoinGecko into `market_prices` + `asset_snapshots`)
