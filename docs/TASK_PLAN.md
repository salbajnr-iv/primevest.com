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

---

## UI Route Audit & Remediation Plan (Canonical)

### Scope and scoring model
- **Inventory sources:** `app/support/page.tsx`, `app/tools/page.tsx`, `app/dashboard/_config/routes.ts`.
- **Score scale:** `1` (poor) to `5` (excellent) on:
  1. Layout hierarchy
  2. Spacing
  3. Typography
  4. Icon consistency
  5. Button consistency
  6. Responsiveness
- **Priority rules:**
  - **P0** = broken/stub/visually fragmented sections
  - **P1** = inconsistent but functional layout
  - **P2** = polish-only

### Linked route inventory + UI quality scoring

| Route | Linked from | Layout | Spacing | Type | Icons | Buttons | Responsive | Priority | Notes |
|---|---|---:|---:|---:|---:|---:|---:|---|---|
| `/support` | tools hub | 4 | 4 | 4 | 4 | 4 | 4 | P2 | Cohesive card hierarchy with consistent CTA patterns. |
| `/support/contact` | support hub | 3 | 3 | 3 | 2 | 2 | 3 | P1 | Mixes legacy utility classes (`card`, `btn`) with newer section shell. |
| `/support/tickets` | support hub | 3 | 3 | 3 | 2 | 2 | 3 | P1 | Functional but dense data layout and inconsistent controls. |
| `/support/status` | support hub | 4 | 4 | 4 | 3 | 3 | 4 | P2 | Generally consistent support-shell page, needs light visual polish only. |
| `/support/community` | support hub | 4 | 4 | 4 | 3 | 3 | 4 | P2 | Clean information structure, minor consistency refinements. |
| `/tools/economic-calendar` | tools hub | 3 | 3 | 3 | 3 | 3 | 3 | P1 | Works but component rhythm differs from tools landing pattern. |
| `/tools/market-news` | tools hub | 3 | 3 | 3 | 3 | 3 | 3 | P1 | Functional page with mixed card density and content treatment. |
| `/tools/analysis` | tools hub | 3 | 3 | 3 | 3 | 3 | 3 | P1 | Usable but lacks strong hierarchy in sections/controls. |
| `/tools/trading-view` | tools hub | 3 | 3 | 3 | 3 | 3 | 3 | P1 | Functional page; button and panel styles should align to shared kit. |
| `/dashboard` | dashboard routes | 3 | 3 | 3 | 3 | 3 | 3 | P1 | Core shell works but styling conventions vary across child surfaces. |
| `/dashboard/overview` | dashboard routes | 3 | 3 | 3 | 3 | 3 | 3 | P1 | Functional overview with uneven spacing and typography scale. |
| `/dashboard/asset-center` | dashboard routes | 3 | 3 | 3 | 3 | 3 | 3 | P1 | Information-dense and functional; needs consistency pass. |
| `/dashboard/trade` | dashboard routes | 3 | 3 | 3 | 2 | 2 | 3 | P1 | Trading form works, but control styling differs from newer components. |
| `/dashboard/orders` | dashboard routes | 3 | 3 | 3 | 2 | 2 | 3 | P1 | Table + filter controls are functional but visually fragmented. |
| `/dashboard/portfolio` | dashboard routes | 3 | 3 | 3 | 3 | 3 | 3 | P1 | Solid baseline, requires spacing and emphasis tuning. |
| `/dashboard/positions` | dashboard routes | 3 | 3 | 3 | 2 | 2 | 3 | P1 | Data blocks are usable but not consistently styled with dashboard kit. |
| `/dashboard/buy` | dashboard routes | 2 | 2 | 2 | 2 | 2 | 2 | **P0** | Legacy-styled flow with visual fragmentation and mixed language labels. |
| `/dashboard/sell` | dashboard routes | 2 | 2 | 2 | 2 | 2 | 2 | **P0** | Similar fragmentation to buy flow; high-priority unification needed. |
| `/dashboard/deposit` | dashboard routes | 2 | 2 | 2 | 2 | 2 | 2 | **P0** | Fragmented payment-step visuals and inconsistent form component style. |
| `/dashboard/swap` | dashboard routes | 3 | 3 | 3 | 2 | 2 | 3 | P1 | Quote logic is improved; UI controls still partially legacy. |
| `/` | tools hub action | 4 | 4 | 4 | 4 | 4 | 4 | P2 | Marketing page appears polished; only incremental cleanup expected. |

### Remediation tracker (owner + acceptance criteria per page)

> **Screenshot gate (required for every page fix):** each remediation PR must include **before + after screenshots** for the modified route(s). Store artifacts under `docs/ui-audit/<route-slug>/before.png` and `docs/ui-audit/<route-slug>/after.png`, and link both in the PR description.

| Route | Priority | Owner | Acceptance criteria |
|---|---|---|---|
| `/dashboard/buy` | P0 | Frontend (Trading) | Uses shared `PageSectionHeader`, `FeatureCard`, and standard `Button` variants; removes fragmented legacy blocks; mobile/desktop layouts verified; before/after screenshots attached. |
| `/dashboard/sell` | P0 | Frontend (Trading) | Matches buy-flow visual system and spacing scale; unifies button/form styles; responsive behavior verified at mobile/tablet/desktop; before/after screenshots attached. |
| `/dashboard/deposit` | P0 | Frontend (Payments) | Multi-step deposit flow uses consistent card hierarchy and input controls; payment-method tiles and CTA states normalized; before/after screenshots attached. |
| `/support/contact` | P1 | Frontend (Support) | Replace legacy `btn/card` treatment with shared UI primitives; maintain success/error/empty states; before/after screenshots attached. |
| `/support/tickets` | P1 | Frontend (Support) | Normalize table/filter/action styling and spacing; improve hierarchy in detail pane; preserve ticket state actions; before/after screenshots attached. |
| `/tools/economic-calendar` | P1 | Frontend (Tools) | Align section spacing, headings, and CTA styles to tools hub; preserve existing data interactions; before/after screenshots attached. |
| `/tools/market-news` | P1 | Frontend (Tools) | Standardize cards, typography rhythm, and action controls; remove visual placeholders where possible; before/after screenshots attached. |
| `/tools/analysis` | P1 | Frontend (Tools) | Clarify section hierarchy and control grouping; align icon/button variants to design system; before/after screenshots attached. |
| `/tools/trading-view` | P1 | Frontend (Tools) | Bring panel and control styling in line with tools design language; confirm responsive chart container behavior; before/after screenshots attached. |
| `/dashboard` | P1 | Frontend (Dashboard Core) | Shell landing content uses consistent typography and spacing tokens; navigation actions visually unified; before/after screenshots attached. |
| `/dashboard/overview` | P1 | Frontend (Dashboard Core) | KPI/stat/summary blocks share card and heading scale; clear visual hierarchy for primary actions; before/after screenshots attached. |
| `/dashboard/asset-center` | P1 | Frontend (Dashboard Core) | Asset list/filter controls and summary widgets use consistent spacing and buttons; verify responsiveness; before/after screenshots attached. |
| `/dashboard/trade` | P1 | Frontend (Trading) | Order form controls and action buttons mapped to shared component variants; spacing and status messaging standardized; before/after screenshots attached. |
| `/dashboard/orders` | P1 | Frontend (Trading) | Table and filter toolbar aligned to consistent layout and button system; empty/loading/error states visually aligned; before/after screenshots attached. |
| `/dashboard/portfolio` | P1 | Frontend (Portfolio) | Portfolio sections follow consistent heading, spacing, and card rhythm; action buttons standardized; before/after screenshots attached. |
| `/dashboard/positions` | P1 | Frontend (Portfolio) | Positions table/cards use unified visual language with clear hierarchy for status and actions; before/after screenshots attached. |
| `/dashboard/swap` | P1 | Frontend (Trading) | Quote/slippage controls fully migrated to shared form and button primitives; responsive dropdown behavior validated; before/after screenshots attached. |
| `/support/status` | P2 | Frontend (Support) | Minor typography/icon/button consistency polish with no flow changes; before/after screenshots attached. |
| `/support/community` | P2 | Frontend (Support) | Apply light consistency pass for cards, icon badges, and spacing; before/after screenshots attached. |
| `/support` | P2 | Frontend (Support) | Optional polish for micro-spacing and badge consistency while preserving current structure; before/after screenshots attached. |
| `/` | P2 | Frontend (Marketing) | Polish-only adjustments must retain current visual hierarchy and performance; before/after screenshots attached. |
