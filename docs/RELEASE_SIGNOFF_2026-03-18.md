# Release Checklist Sign-off — 2026-03-18

## Scope
- API regression execution for auth, admin, trading, wallets, profile, support, and KYC flows.
- Trigger/reconciliation verification for balance/ledger impacts tied to trading + wallet lifecycle.
- Responsive verification across mobile/tablet/desktop for prioritized routes.
- Observability readiness checks for logs, webhooks, cron ingestion failures, and realtime behavior.

## 1) API regression suite execution

### 1.1 Postman collection (`primevest-api.postman_collection.json`)
Executed with Newman against `http://localhost:3000` and an invalid bearer token to validate auth/guardrail behavior.

| Request | Result | Notes |
|---|---:|---|
| Dashboard Summary GET | 403 | Guardrail enforcement confirmed with invalid token. |
| KYC Submit POST | 403 | Guardrail enforcement confirmed with invalid token. |
| Admin User Delete POST | 403 | Guardrail enforcement confirmed with invalid token. |
| Support Tickets GET | 403 | Guardrail enforcement confirmed with invalid token. |
| Support Ticket Create POST | 403 | Guardrail enforcement confirmed with invalid token. |

### 1.2 Extended flow coverage (curl matrix)

| Domain | Endpoint | Status | Outcome |
|---|---|---:|---|
| Auth | `GET /api/dashboard/summary` | 401 | Correct unauthenticated response without valid session. |
| Admin | `POST /api/admin/users/delete` | 500 | **Defect**: server-side config dependency error (`supabaseKey is required`). |
| Trading | `POST /api/orders` | 401 | Invalid token handling works. |
| Trading | `GET /api/orders/history` | 401 | Invalid token handling works. |
| Trading | `GET /api/positions` | 401 | Invalid token handling works. |
| Wallets | `POST /api/wallets/withdraw` | 400 | Input validation active (`Unsupported currency`). |
| Wallets | `GET /api/wallets/withdraw-requests` | 405 | Method contract enforced. |
| Wallets | `POST /api/wallets/deposit-intents` | 401 | Invalid token handling works. |
| Profile | `GET /api/profile/avatar-url` | 500 | **Defect**: server-side config dependency error (`supabaseKey is required`). |
| Support | `GET /api/support/tickets` | 503 | Support backend unavailable in current env. |
| Support | `POST /api/support/tickets` | 503 | Support backend unavailable in current env. |
| KYC | `POST /api/kyc/submit` | 500 | **Defect**: server-side config dependency error (`supabaseKey is required`). |
| Observability endpoint | `GET /api/support/status` | 200 | Status payload returned as expected. |

## 2) Trigger-driven reconciliation verification

### 2.1 What was verifiable in this environment
- SQL lifecycle and reconciliation logic exists for wallet/deposit/withdraw state transitions and audit rows.
- Atomic order workflow updates profile balance and writes `balance_history` + `transactions` in a single RPC path.

### 2.2 What is blocked
- Full execution of DB-level reconciliation tests requires a live Supabase Postgres with migrations applied and authenticated SQL session contexts.
- This run environment did **not** include a configured Supabase backend (`supabaseKey` missing for several API paths), so runtime ledger assertions could not be executed end-to-end.

### 2.3 Expected ledger effects (from SQL contracts)
- Buy order: decrements `profiles.account_balance`, inserts `balance_history` row (`subtract`), and inserts a `transactions` row.
- Wallet lifecycle E2E SQL covers deposit intent/success, withdrawal request/approval/success, and failure/reversal settlement transitions with `transaction_state_audit` checks.

## 3) Responsive verification (prioritized routes)

Prioritized routes tested: `/`, `/dashboard`, `/dashboard/trade`.

| Viewport | Routes tested | HTTP result | Console/runtime errors |
|---|---|---|---|
| Mobile (390x844) | 3 | 200 for all | None captured |
| Tablet (768x1024) | 3 | 200 for all | None captured |
| Desktop (1440x900) | 3 | 200 for all | None captured |

### Defects logged (priority / owner)
| Priority | Owner | Defect | Impact |
|---|---|---|---|
| P0 | Backend Platform | `supabaseKey is required` 500s on admin/profile/kyc API paths in current env | Blocks production-like API regression sign-off for privileged/profile/KYC flows |
| P1 | Support Services | Support ticket APIs return 503 in current env | Support flow non-functional in test environment |
| P2 | QA/Release | Wallet reconciliation and order-ledger runtime assertions are blocked without provisioned Supabase test backend | Prevents full trigger-level release confidence |

## 4) Observability confirmation

| Area | Verification status | Evidence |
|---|---|---|
| Error/status surfacing | Partial pass | `GET /api/support/status` returns structured incident/maintenance payload. |
| Webhook failure tracking | Contract present | Provider webhook/transaction state audit migration is present; runtime verification blocked without DB+webhook fixtures. |
| Cron ingestion failure monitoring | Contract present | `market_data_ingest_failures` table + `pg_cron`/`pg_net` scheduling migration exists; runtime verification blocked without Supabase env. |
| Realtime disconnect handling | Gap identified | Realtime subscriptions exist, but no explicit disconnect/retry alert handling path was validated in this run. |

## 5) Release checklist sign-off

### Non-blocked items
- Route contract checks and breakpoint consistency checks passed.
- Responsive smoke across prioritized routes passed (HTTP + browser runtime error baseline).
- Postman collection executed successfully as a regression harness (negative-auth path).

### Blocked items
- Full authenticated regression for admin/trading/wallet/profile/support/KYC with valid JWT + live Supabase.
- Trigger-driven reconciliation runtime assertions (trade fill, position updates, ledger/balance impacts).
- End-to-end webhook failure and cron ingestion operational verification in runtime.

### Rollback notes
If release proceeds with known blockers and runtime incidents occur:
1. Roll back application deployment to previous stable build.
2. Disable/rollback newest DB migrations touching trading/wallet/provider webhook paths (use migration down strategy / restore snapshot).
3. Pause scheduled ingestion jobs (`market-price-ingest-*`) until health checks recover.
4. Revert provider webhook routing changes to previous stable endpoint secret/version.
5. Re-run wallet lifecycle SQL E2E in staging before re-promoting.
