# Codebase Issue Tasks

## 1) Typo fix task
**Issue found:** Brand capitalization is inconsistent in a user-facing sentence (`Primevest` vs `PrimeVest`).
- Location: `app/page.tsx`
- Current text snippet: `Inspired by the Primevest Capital Partners entry page...`

**Proposed task:**
- Update `Primevest` to `PrimeVest` in the homepage “PrimeVest Vision” section.
- Run a quick copy consistency pass for brand mentions in the same file to ensure capitalization remains consistent.

**Acceptance criteria:**
- The sentence renders with correct brand capitalization (`PrimeVest`).
- No lint or TypeScript regressions are introduced.

---

## 2) Bug fix task
**Issue found:** The Support page links to routes that do not exist, causing navigation to dead pages (404s).
- Location: `app/support/page.tsx`
- Affected links: `/support/tickets`, `/support/status`, `/support/community`, `/support/contact`
- Observed project structure: only `app/support/page.tsx` and `app/support/faqs/page.tsx` currently exist.

**Proposed task:**
- Either implement the missing route pages or replace these links with existing routes until those pages are built.
- Add a lightweight route check (or test) to catch internal links to missing pages.

**Acceptance criteria:**
- Each Support quick-action link resolves to an existing page.
- No 404s occur when using Support quick actions from the UI.
