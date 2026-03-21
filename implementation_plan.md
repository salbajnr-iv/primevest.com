# Implementation Plan

## Overview

Fix the Next.js Turbopack build failure caused by invalid import placement in app router API route handlers and address other potential build blockers. The primary error occurs in `./app/api/kyc/submit/route.ts` where an `import { createClient } from "@supabase/supabase-js";` statement appears mid-function after a `return` statement at line 29, causing a parsing error. Similar direct `@supabase/supabase-js` imports exist in other API routes and lib files, which should be refactored to use the project's established server-side Supabase wrappers (`lib/supabase/admin.ts`, `lib/supabase/server.ts`) for consistency and "server-only" compliance. Secondary issues include a deprecated "middleware" warning (handled by keeping existing `middleware.ts` and monitoring Next.js updates) and potential TS errors noted in TODO-FIX-BUILD.md.

## Types

No new types required. Reuse existing Supabase client return types from `@supabase/supabase-js` via wrapper functions.

## Files

Update 4 existing API route files to remove invalid/mid-file imports and use Supabase wrappers. No new files; no deletions.

- `app/api/kyc/submit/route.ts`: Move rogue import to top, replace duplicate client creation with `createAdminClient()`.
- `app/api/admin/transactions/withdraw-review/route.ts`: Remove top-level `createClient` import, use `createAdminClient()`.
- `lib/supabase/admin.ts`: Minor - ensure singleton pattern is build-safe (already appears correct).
- `lib/supabase/server.ts`: Already uses `@supabase/ssr` correctly; no changes but verify in context.
- Optional: Update `lib/market/snapshots.ts` if it uses direct import in server context.

## Functions

Update client creation calls in API handlers to use wrappers.

- Modified: `POST` handler in `app/api/kyc/submit/route.ts` - replace raw `createClient(supabaseUrl, serviceRoleKey, ...)` calls with `createAdminClient()`.
- Modified: Client creation in `app/api/admin/transactions/withdraw-review/route.ts` - replace direct import/creation with `createAdminClient()`.
- No new/removed functions.

## Classes

No class modifications required.

## Dependencies

No changes. Uses existing `@supabase/supabase-js@^2.45.0` and `@supabase/ssr@^0.8.0`.

## Testing

Run `npm run lint` (should pass), `npm run build` (primary validation - expect success), `npm run dev` (smoke test startup). Test affected endpoints manually via Postman collection or browser:

- POST `/api/kyc/submit` with auth token and mock documents.
- Admin endpoints if accessible.
- Verify no runtime errors in dev mode for KYC submission flow.

## Implementation Order

1. Fix primary error file: edit `app/api/kyc/submit/route.ts` to move import to top and refactor client creation.
2. Run `npm run build` to confirm primary fix resolves parsing error.
3. Fix similar pattern in `app/api/admin/transactions/withdraw-review/route.ts`.
4. Check `lib/market/snapshots.ts` and fix if server-context direct import.
5. Run full `npm run lint && npm run build` to validate all changes.
6. Update TODO-FIX-BUILD.md with verification log.
