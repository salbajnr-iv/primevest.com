# Product & Platform Task Plan (Canonical Roadmap)

> This is the single source of truth for open work migrated from `TODO_DASHBOARD.md`, `RESPONSIVENESS_TODO.md`, `RENAME_TODO.md`, and `ADMIN_TODO.md`.

## Prioritization legend
- **P0**: blocks release quality, correctness, or operational readiness
- **P1**: high-value UX/product improvements
- **P2**: cleanup/polish

## P0 — Release & Operations

### 1) Complete admin production rollout
- **Owner:** DevOps + Backend
- **Dependency:** deploy + DB
- **Acceptance criteria:**
  - All required SQL scripts have been executed in order in production.
  - Validation queries from the migration runbook pass with expected tables/functions/policies.
  - At least one real admin user exists via `public.set_admin_role(...)`.
  - Required env vars are configured in deployment.
  - Admin route strategy (`/admin` and optional admin subdomain) is verified in production.

### 2) Add swap execution safeguards/details (rate, slippage, minimum received)
- **Owner:** Frontend + Backend
- **Dependency:** code (+ optional quote API)
- **Acceptance criteria:**
  - Swap screen shows quote rate and estimated receive before confirmation.
  - Slippage tolerance is visible/editable with validation bounds.
  - Minimum received is displayed and passed to review/submit flow.
  - Submission is blocked when quote is stale or minimum receive cannot be met.

## P1 — Core Product UX

### 3) Add holdings filtering + sorting on portfolio holdings table
- **Owner:** Frontend
- **Dependency:** code
- **Acceptance criteria:**
  - Holdings can be filtered (at least by asset symbol/name).
  - Holdings can be sorted by allocation, value, and PnL.
  - Active filters/sort are visible in UI and can be reset.

### 4) Complete buy flow market impact visibility
- **Owner:** Frontend + Backend
- **Dependency:** code
- **Acceptance criteria:**
  - Buy flow displays explicit market impact estimate (not only fees/total).
  - Impact value is shown on input and review steps.
  - Warning style appears when impact exceeds threshold.

### 5) Unify responsive breakpoint contract in CSS + JS
- **Owner:** Frontend
- **Dependency:** code
- **Acceptance criteria:**
  - CSS exposes breakpoint custom properties (`--bp-sm` ...).
  - JS hook and CSS reference one canonical breakpoint set.
  - `data-breakpoint` attribute maps to the same thresholds used in layout rules.

## P2 — Verification, Rename Cleanup, and QA

### 6) Responsive verification pass across target viewports
- **Owner:** QA + Frontend
- **Dependency:** code (if defects found)
- **Acceptance criteria:**
  - Mobile, tablet, desktop viewport checks documented.
  - Resize transitions are smooth on dashboard shell/sidebar/bottom-nav.
  - Any regressions discovered are fixed or tracked with owners.

### 7) Rename cleanup: retire legacy Bitpanda-specific component naming
- **Owner:** Frontend
- **Dependency:** code
- **Acceptance criteria:**
  - `components/BitpandaNavbar.tsx` is removed or renamed to a PrimeVest-neutral name.
  - No user-facing text contains legacy Bitpanda branding across scoped pages/components.
  - Build passes with updated imports/usage.

### 8) Final product polish checks (navigation and performance)
- **Owner:** Frontend + QA
- **Dependency:** code
- **Acceptance criteria:**
  - End-to-end navigation flow validation completed for dashboard and trading paths.
  - Performance pass completed (images, bundle hotspots, interaction latency).
  - Findings are resolved or tracked with priority/owner.
