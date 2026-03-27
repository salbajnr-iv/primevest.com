# Database table inventory (derived from codebase)

This inventory is derived from all `supabase.from("...")` / `supabase.from('...')` calls across `app/`, `lib/`, `components/`, and `contexts/`.

## Public schema tables used by the app/API

- `admin_actions`
- `asset_snapshots`
- `assets`
- `balance_history`
- `balances`
- `kyc_documents`
- `kyc_requests`
- `ledger_entries`
- `ledger_idempotency`
- `market_data_source_health`
- `market_prices`
- `notifications`
- `orders`
- `positions`
- `profiles`
- `reports`
- `support_ticket_replies`
- `support_tickets`
- `trades`
- `transactions`
- `wallets`

## Supabase Storage system tables referenced

These are in the `storage` schema and are managed by Supabase, not custom app migrations:

- `buckets`
- `objects`

Additionally, the app references bucket id `avatars` (bucket name), which is not a Postgres table.

## Gaps found and fixed

The repository had usage references but no `CREATE TABLE` statement for these public tables in checked-in SQL/migrations:

- `balances`
- `notifications`
- `reports`

A new migration was added to create them idempotently (with indexes + baseline RLS policies):

- `supabase/migrations/20260327090000_create_missing_core_tables.sql`

## Notes

- `types/supabase.ts` currently does not include some tables used by runtime code (`balances`, `notifications`, `reports`, `transactions`, `ledger_idempotency`, `market_data_source_health`).
- After running migrations in your Supabase project, regenerate types:

```bash
supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" --schema public > types/supabase.ts
```
