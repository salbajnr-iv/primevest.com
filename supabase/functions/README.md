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

## Market data scheduling and monitoring

- Schedule `market-price-ingest` with Supabase scheduled functions (or external cron) every 1-2 minutes.
- The function applies retry/backoff on provider failures and records source health in `public.market_data_source_health`.
- Latest normalized snapshots are materialized via `refresh_asset_snapshots` from `market_prices` for dashboard/trading reads.
