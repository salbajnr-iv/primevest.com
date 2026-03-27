# Backend API ownership matrix

This document inventories every route under `app/api/` and maps it to the backend contract defined in `app/api/Backendguide.md`, especially the **Recommended API endpoints & contracts** and **RLS & security responsibilities** sections. The goal is to make route ownership explicit so future additions follow the same model instead of mixing browser-safe reads with privileged writes. 

## Baseline contract from `Backendguide.md`

- Use the user's Supabase session plus RLS for normal user-scoped reads whenever the route only needs row ownership checks. 
- Keep `service_role` usage server-side only, and reserve it for privileged operations that must bypass RLS, such as admin actions, signed storage access, and financial ledger writes. 
- Treat **financial operations** as transactional, idempotent, audited, and never client-direct; these should execute behind a trusted backend boundary. 
- Treat **admin** and **callback/webhook** flows as privileged integrations; prefer a Supabase Edge Function when the route performs cross-table mutations, provider verification, or external side effects. 
- Direct SQL/select or direct Supabase Auth calls are acceptable for simple reads/session endpoints that do not need orchestration beyond the request lifecycle. 

## Ownership decision rules

### Direct SQL/RPC from `app/api`
Use direct table reads or direct auth calls when all of the following are true:

1. the route is read-only or a simple auth/session wrapper;
2. the route can rely on user-session RLS or on a narrowly scoped server-side signed URL operation;
3. the route does not need privileged multi-step financial/admin orchestration.

### Forward to a Supabase Edge Function
Use an Edge Function when any of the following are true:

1. the route is a **financial write** (orders, swaps, deposits, withdrawals, balance-changing actions);
2. the route is an **admin mutation** or batch operation;
3. the route is a **provider callback/webhook**;
4. the route needs service-role enforcement, idempotency, auditing, or cross-table transactions beyond a single simple query.

## Route matrix

| Route | Methods | Auth method | Database objects touched | Enforcement today | Recommended ownership | Classification |
| --- | --- | --- | --- | --- | --- | --- |
| `app/api/admin/check/route.ts` | `GET` | Cookie session via `@/lib/supabase/server`, then `supabase.auth.getUser()` | `public.profiles.is_admin` | RLS/user-session read; no service-role bypass | Direct SQL/auth from route | Server-only admin gate |
| `app/api/admin/kyc/document/route.ts` | `GET` | Admin bearer token via `verifyAdminBearerToken()` | `public.profiles` (inside verifier), `public.kyc_documents`, `storage.objects` in bucket `kyc-documents` via signed URL | Service-role enforcement after admin verification | Direct server read is acceptable because it is a signed-URL helper, but keep server-only | Server-only admin |
| `app/api/admin/kyc/requests/route.ts` | `GET` | Admin bearer token via `verifyAdminBearerToken()` | `public.profiles` (inside verifier), `public.kyc_requests`, `public.kyc_documents`, `public.profiles` join for applicant info | Service-role enforcement after admin verification | Direct SQL from route for admin read-only listing/detail | Server-only admin |
| `app/api/admin/kyc/review/route.ts` | `POST` | Admin bearer token via `verifyAdminBearerToken()` | Edge Function owns writes to `public.kyc_requests`, `public.profiles`, `public.admin_actions` per contract | Admin verification in route, privileged work delegated to Edge Function | Forward to Supabase Edge Function (`admin-kyc-decision`) | Edge-function-only admin |
| `app/api/admin/simulate/route.ts` | `POST` | Admin bearer token via `verifyAdminBearerToken()` | Edge Function owns batch maintenance operations against privileged tables/RPCs | Admin verification in route, privileged work delegated to Edge Function | Forward to Supabase Edge Function (`admin-maintenance-batch`) | Edge-function-only admin |
| `app/api/admin/transactions/withdraw-review/route.ts` | `POST` | Admin bearer token via `verifyAdminBearerToken()` | `public.profiles` (inside verifier), RPC `review_withdrawal_request` touching withdrawal/ledger/admin-audit data | Mixed: admin verified in route, then RPC executes through user-context client; contractually this is privileged financial review | **Should forward to an Edge Function** so service-role, idempotency, and audit live in one trusted backend | Edge-function-only admin + financial |
| `app/api/admin/users/delete/route.ts` | `POST` | Admin bearer token via `verifyAdminBearerToken()` | `public.profiles`, `public.admin_actions`, `auth.users` via `supabase.auth.admin.deleteUser()` | Service-role enforcement after admin verification | Direct server admin action is acceptable, but Edge Function would also be valid if deletion workflow expands | Server-only admin |
| `app/api/admin/users/impersonate/route.ts` | `POST` | Admin bearer token via `verifyAdminBearerToken()` | `public.profiles`, `public.admin_actions` | Service-role enforcement after admin verification | Direct server admin action is acceptable while it only audits and returns metadata | Server-only admin |
| `app/api/auth/session/route.ts` | `GET` | Cookie session via `@/lib/supabase/server` | Supabase Auth session/user objects only | Supabase Auth session enforcement | Direct auth call from route | Shared server route |
| `app/api/auth/signin/route.ts` | `POST` | Email/password to Supabase Auth | Supabase Auth (`auth.users`, sessions) | Supabase Auth enforcement | Direct auth call from route | Shared server route |
| `app/api/auth/signout/route.ts` | `POST` | Cookie-based SSR auth client | Supabase Auth session cookies/tokens | Supabase Auth enforcement | Direct auth call from route | Shared server route |
| `app/api/auth/signup/route.ts` | `POST` | Email/password to Supabase Auth | Supabase Auth (`auth.users`, identities); profile creation is expected elsewhere per guide | Supabase Auth enforcement | Direct auth call from route | Shared server route |
| `app/api/buy/market-impact/route.ts` | `POST` | None | RPC `estimate_buy_market_impact` when available; otherwise no DB write | No user RLS requirement; service role only used for an estimation helper | Direct RPC/read helper from route | Server-only financial helper |
| `app/api/dashboard/activity/route.ts` | `GET` | Cookie session via `@/lib/supabase/server` | `public.orders`, `public.transactions` | RLS on user-owned rows | Direct SQL from route | Shared server route |
| `app/api/dashboard/aggregates/route.ts` | `GET` | Cookie session via `@/lib/supabase/server` | `public.profiles`, `public.notifications`, `public.orders`, plus service-role-backed market snapshot read through helper | Mixed: user data via RLS; market freshness via server-side service role | Direct route queries are acceptable; keep market snapshot helper server-side | Shared server route |
| `app/api/dashboard/asset-center/route.ts` | `GET` | Bearer token validated with service-role client | `public.profiles`, `public.orders` | Service-role enforcement today even though data is user-scoped | **Should use direct RLS reads instead of service role** because this is a user-scoped read, not a privileged admin/financial mutation | Shared server route |
| `app/api/dashboard/performance/route.ts` | `GET` | Cookie session via `@/lib/supabase/server` | `public.wallets`, `public.positions` | RLS on user-owned rows | Direct SQL from route | Shared server route |
| `app/api/dashboard/summary/route.ts` | `GET` | Cookie session via `@/lib/supabase/server` | `public.profiles`, `public.notifications`, plus market freshness helper reading `asset_snapshots` | User data via RLS; market freshness via server-side helper | Direct SQL from route | Shared server route |
| `app/api/investment-card-images/[slug]/route.ts` | `GET` | None | None | No DB access | Direct file/static response from route | Public server route |
| `app/api/kyc/provider-callback/route.ts` | `POST` | Provider signature header `x-kyc-signature` | Edge Function should own provider verification and resulting writes to `public.kyc_requests`, `public.kyc_documents`, `public.profiles`, `public.admin_actions` as needed | Delegated to Edge Function | Forward to Supabase Edge Function (`kyc-provider-callback`) | Edge-function-only callback |
| `app/api/kyc/submit/route.ts` | `POST` | Bearer token validated with service-role client | `public.kyc_requests`, `public.kyc_documents`, `public.profiles` | Service-role bypass today; writes are multi-table and affect compliance state | **Should forward to an Edge Function** so KYC submission validation, auditability, and storage checks sit behind a privileged boundary | Edge-function-only compliance |
| `app/api/market/latest/route.ts` | `GET` | None | Market snapshot source via helper (`asset_snapshots` fallback / external price service) | Server-side read only | Direct read from route | Public server route |
| `app/api/orders/history/route.ts` | `GET` | Cookie session via `@/lib/supabase/server` | `public.orders` | RLS on user-owned rows | Direct SQL from route | Server-only financial read |
| `app/api/orders/route.ts` (`POST`) | `POST` | Bearer token validated with anon-key client | RPC `create_order_atomic`; also writes `public.admin_actions` audit row | Financial mutation currently depends on RPC plus extra write in route; not fully isolated behind service-role boundary | **Should forward to an Edge Function** for transactional order placement + idempotent audit | Edge-function-only financial |
| `app/api/orders/route.ts` (`GET`) | `GET` | Bearer token validated with service-role client | `public.orders` | Service-role read today on user-scoped data | Direct SQL from route **with RLS instead of service role** | Server-only financial read |
| `app/api/positions/route.ts` | `GET` | Bearer token validated with anon-key client | `public.positions`, joined asset metadata (`public.assets` via `asset_id`) | RLS on user-owned rows | Direct SQL from route | Shared server route |
| `app/api/primevest-expertise-images/[slug]/route.ts` | `GET` | None | None | No DB access | Direct file/static response from route | Public server route |
| `app/api/profile/avatar-url/route.ts` | `GET` | Bearer token validated with service-role client | `public.profiles.avatar_storage_path`, storage bucket `avatars` | Service-role signed URL generation | Direct server helper is acceptable; keep server-only because signed URL generation is privileged | Server-only signed-storage |
| `app/api/step-card-images/[slug]/route.ts` | `GET` | None | None | No DB access | Direct file/static response from route | Public server route |
| `app/api/support/community/route.ts` | `GET` | None | None | No DB access | Direct response from route | Public server route |
| `app/api/support/contact/route.ts` | `POST` | None | `public.support_tickets` | Service-role insert because this is a public contact form without user session/RLS ownership | Direct server write is acceptable; keep server-only and rate-limited | Server-only support |
| `app/api/support/status/route.ts` | `GET` | None | None | No DB access | Direct response from route | Public server route |
| `app/api/support/tickets/[id]/reply/route.ts` | `POST` | Bearer token validated with service-role client | `public.support_tickets`, `public.support_ticket_replies` | Service-role enforcement today for authenticated user-owned support data | Direct route writes are acceptable, but should ideally use RLS/session client instead of service role because ownership is user-scoped | Server-only support |
| `app/api/support/tickets/[id]/route.ts` | `GET` | Bearer token validated with service-role client | `public.support_tickets`, `public.support_ticket_replies` | Service-role enforcement today for authenticated user-owned support data | Direct SQL from route, preferably under RLS rather than service role | Server-only support |
| `app/api/support/tickets/route.ts` (`GET`) | `GET` | Bearer token validated with service-role client | `public.support_tickets` | Service-role enforcement today for user-owned support data | Direct SQL from route, preferably under RLS rather than service role | Server-only support |
| `app/api/support/tickets/route.ts` (`POST`) | `POST` | Bearer token validated with service-role client | `public.support_tickets` | Service-role enforcement today for user-owned support data | Direct SQL from route, preferably under RLS rather than service role | Server-only support |
| `app/api/swap/execute/route.ts` | `POST` | Cookie session via `@/lib/supabase/server` | RPC `execute_swap_atomic` plus market snapshot reads used for preflight | Financial mutation under RPC; route performs quote validation before execution | **Should forward to an Edge Function** so quote validation, service-role execution, idempotency, and audit live together | Edge-function-only financial |
| `app/api/swap/quote/route.ts` | `POST` | None | Market snapshot reads through helper (`asset_snapshots` fallback / price service) | Server-side read only | Direct read/helper route | Server-only financial helper |
| `app/api/transactions/history/route.ts` | `GET` | Bearer token validated with anon-key client | `public.transactions` | RLS on user-owned rows | Direct SQL from route | Server-only financial read |
| `app/api/wallets/deposit-intents/route.ts` | `POST` | Bearer token validated with anon-key client | RPC `create_deposit_intent` | Financial mutation; idempotent intent creation should be server-trusted | **Should forward to an Edge Function** | Edge-function-only financial |
| `app/api/wallets/withdraw/route.ts` (`POST`) | `POST` | Bearer token validated with anon-key client | RPC `request_withdrawal_review` | Financial mutation; balance-affecting withdrawal flow must be privileged and idempotent | **Should forward to an Edge Function** | Edge-function-only financial |
| `app/api/wallets/withdraw/route.ts` (`GET`) | `GET` | Bearer token validated with anon-key client | `public.transactions` | RLS on user-owned rows | Direct SQL from route | Server-only financial read |
| `app/api/wallets/withdraw-requests/route.ts` | `POST` | Bearer token validated with anon-key client | RPC `request_withdrawal_review` | Financial mutation; same privileged flow as withdrawal submission | **Should forward to an Edge Function** | Edge-function-only financial |

## Summary by ownership class

### Direct route + RLS/session-friendly reads
These routes should stay as direct route handlers backed by user-session auth and RLS:

- dashboard read endpoints;
- positions, transaction history, order history, and withdrawal-status reads;
- session/auth wrappers;
- support ticket reads/writes **after** migrating away from unnecessary service-role usage;
- public/static content endpoints.

### Server-only direct privileged helpers
These routes can remain direct server handlers because they are simple privileged helpers, not workflow engines:

- signed storage URL helpers (`profile/avatar-url`, `admin/kyc/document`);
- public support contact intake;
- admin read/listing endpoints (`admin/check`, `admin/kyc/requests`);
- compact admin actions that do not yet require orchestration (`admin/users/delete`, `admin/users/impersonate`).

### Edge-function-only endpoints
These are the endpoints that should be treated as the privileged backend boundary for future work:

- `app/api/kyc/provider-callback/route.ts`;
- `app/api/admin/kyc/review/route.ts`;
- `app/api/admin/simulate/route.ts`;
- `app/api/admin/transactions/withdraw-review/route.ts`;
- `app/api/kyc/submit/route.ts`;
- `app/api/orders/route.ts` `POST`;
- `app/api/swap/execute/route.ts`;
- `app/api/wallets/deposit-intents/route.ts`;
- `app/api/wallets/withdraw/route.ts` `POST`;
- `app/api/wallets/withdraw-requests/route.ts`.

## Guardrails for future route additions

When adding a new `app/api/*` route, apply this checklist before choosing an implementation:

1. **Is it user-scoped read-only data?** Use session auth + RLS and query directly from the route.
2. **Does it sign storage access?** Keep it server-only and make the route return a signed URL, never the service-role key.
3. **Does it move money, mutate balances, create orders, process swaps, or change compliance state?** Put the real logic in a Supabase Edge Function.
4. **Is it an admin mutation or webhook/callback?** Default to Edge Function ownership.
5. **Does it only use service role because the current code bypasses RLS for convenience?** Prefer moving back to RLS for user-owned reads.
6. **Does it need idempotency, audit logs, or multi-table transactions?** Edge Function or equivalent trusted backend worker only.

## Known mismatches to prioritize

The following routes work today but do not match the baseline contract as cleanly as they should:

- `dashboard/asset-center`, `orders` `GET`, and the support ticket routes use service-role access for data that appears user-owned and should typically sit behind RLS.
- `kyc/submit`, `orders` `POST`, `swap/execute`, `wallets/deposit-intents`, `wallets/withdraw`, `wallets/withdraw-requests`, and `admin/transactions/withdraw-review` are privileged write paths that should converge on Edge Function ownership.
- `orders` `POST` also writes `admin_actions` from the route itself; that audit behavior should move into the same trusted execution unit as the financial mutation.
