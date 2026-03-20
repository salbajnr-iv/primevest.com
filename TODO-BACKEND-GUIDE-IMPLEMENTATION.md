# TODO-BACKEND-GUIDE-IMPLEMENTATION.md

Comprehensive TODO list derived from Backendguide.md review for Primevest Supabase backend implementation. Prioritized for financial safety (ledger first), admin/KYC, and project alignment (Next.js API routes, Supabase functions, open tabs like app/admin/kyc, balances).

Status legend: ⏳ Pending | 🔄 In Progress | ✅ Done | ❌ Blocked

## 1. Prerequisites & Setup (⏳ High Priority)
- [ ] Install dependencies: `npm i pg @types/pg zod @supabase/supabase-js@latest`
- [ ] Set env vars: `SUPABASE_DB_URL`, `SUPABASE_SERVICE_ROLE_KEY` (never client-side)
- [ ] Verify DB tables exist: profiles, kyc_requests, kyc_documents, wallets, balances, ledger_entries, ledger_idempotency, admin_actions (use Supabase dashboard)
- [ ] Test DB connection with pg Pool in a script: `scripts/test-pg-pool.ts`

## 2. Ledger & Financial Ops (✅ Done)
- [x] Create `app/api/ledger/transfer/route.ts` (via RPC 'process_ledger_transfer').
- [ ] Create `supabase/functions/ledger-transfer/index.ts` (Deno/Edge version).
- [x] Add Zod schema validation for TransferReq.
- [x] Test concurrency: Created `scripts/test-idempotency.js` for parallel request testing.
- [x] Integrate with `app/admin/balances/page.tsx`: Call API on balance adjustments.
- [x] Add realtime broadcast on success (updated `lib/supabase/realtime.ts`).

## 3. KYC Workflow (✅ Done)
- [x] Create `app/api/kyc/requests/route.ts` (POST: create request + documents metadata).
- [x] Create `app/api/kyc/review/route.ts` (admin POST: update status, audit log).
- [x] Update `app/admin/kyc/page.tsx` & `KycReviewModal.tsx`: Fetch via new APIs.
- [x] Storage: Verified private 'kyc-documents' bucket in migrations; implemented signed URLs in `app/api/admin/kyc/document/route.ts`.
- [x] Test flow: Upload → Request → Admin review → Profile update.

## 4. Admin & Auditing (✅ Done)
- [x] Create `app/api/admin/actions/route.ts` (log all admin ops).
- [x] Enhance `contexts/AdminAuthContext.tsx`: Check `profiles.is_admin` (implemented via `verifyAdminBearerToken` in API).
- [x] Audit balance changes in `app/admin/balances/page.tsx`.
- [x] Create `app/api/admin/users/status/route.ts` for audited status toggles.
- [x] Implement Audit log viewer in `app/admin/audit/page.tsx`.
- [x] Create `app/api/admin/balances/route.ts` for secure history fetch.

## 5. Auth & Profiles (✅ Done)
- [x] Create `app/api/auth/me/route.ts` (combine auth.users + profiles).
- [x] Update `app/api/auth/signup/route.ts`: Auto-create profile post-signup.
- [x] PATCH `/profiles/:id` with validation (email uniqueness managed by Supabase Auth).

## 6. Security & RLS (🔄 In Progress)
- [x] Audit RLS policies: Implemented `supabase/migrations/20261013000000_ledger_and_wallets_rls.sql` to harden financial tables (users read-only).
- [ ] Test unauthorized access: Create script to verify users cannot update wallets via REST.
- [ ] Rotate service_role key if exposed.

## 7. Performance & Monitoring (✅ Done)
- [x] Add indexes: Implemented `supabase/migrations/20261011000000_performance_indexes.sql`.
- [x] pg_cron jobs: Implemented `supabase/migrations/20261012000000_aggregates_and_cron.sql` for nightly `user_asset_aggregates`.
- [ ] Logging: Integrate Sentry/LogRocket for errors (Needs external setup).

## 8. Testing (🔄 In Progress)
- [x] Update `primevest-api.postman_collection.json`: Added Ledger and Audit Log endpoints.
- [ ] E2E: Playwright tests for KYC flow, concurrent transfers.
- [x] Unit: Created `scripts/test-idempotency.js` for ledger verification.

## 9. Cleanup & Polish (⏳ Low)
- [ ] Update Backendguide.md: Fix versions, format code blocks.
- [ ] Cross-check `TODO-FIX-TS-ERRORS.md`, `TODO-REALTIME-FIX.md`.
- [ ] Deploy: `npm run build` && Supabase functions deploy.

## Follow-up
- Blockers: DB schema mismatches?
- Timeline: Ledger in 1 day, KYC in 2 days.
- Track progress: Mark ✅ here or use GitHub issues.

Estimated effort: 1-2 weeks to full implementation. Start with #1-2 for quick wins.
