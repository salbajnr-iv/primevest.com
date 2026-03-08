# Codebase Issue Tasks

## 0) Highest-priority branding task (PrimeVest migration)
**Priority:** P0 - Urgent

**Issue found:** User-facing pages still showed legacy Bitpanda branding in headings, metadata, copy, social labels, and contact text.

**Proposed task:**
- Replace all user-visible `Bitpanda` / `Bitpanda Pro` strings across app pages/components with `PrimeVest`.
- Ensure metadata and social tags also use `PrimeVest` to keep browser title/snippet branding consistent.
- Remove redundant/corrupted UI artifacts that can reintroduce stale branding.

**Acceptance criteria:**
- No UI page renders `Bitpanda` text; all visible branding is `PrimeVest` only.
- Landing page metadata/title/description use `PrimeVest`.
- Redundant/corrupted placeholder files are removed from active UI flow.

---

## 1) Typo fix task
**Issue found:** In the support FAQ copy, one sentence starts with lowercase “withdrawals” after a period, which is a text typo/grammar issue for user-facing content.
- Location: `app/support/page.tsx`
- Current text snippet: `... Enter the destination address and amount. withdrawals are processed within 24 hours.`

**Proposed task:**
- Update the sentence to proper capitalization and grammar (`Withdrawals are processed within 24 hours.`).
- Do a quick copy pass in `app/support/page.tsx` for similar sentence-boundary capitalization issues.

**Acceptance criteria:**
- The text in the FAQ entry uses proper sentence capitalization.
- No new lint or TypeScript errors are introduced.

---

## 2) Bug fix task
**Issue found:** On the withdrawal page, USDT amounts are displayed with the euro symbol (`€`) in at least two places, which is a currency-formatting bug.
- Location: `app/wallets/withdraw/page.tsx`
- Current behavior: The rendering condition treats `USDT` like `EUR` when deciding the symbol.

**Proposed task:**
- Introduce a single currency-format helper for symbol/precision on the withdrawal page.
- Ensure USDT uses the correct symbol/prefix strategy (e.g., `USDT` label only, or `$` if product convention requires that) and align both “Available Balance” and “Available” hint.

**Acceptance criteria:**
- USDT no longer displays `€`.
- Symbol/precision behavior is consistent for EUR, USDT, BTC, and ETH across all amount displays in this page.

---

## 3) Comment/documentation discrepancy task
**Issue found:** The test script documentation says to run `npx supabase login` if no user is authenticated, but the script uses anon key client auth (`supabase.auth.getUser()`), where CLI login is not sufficient to provide an in-script session. This is a misleading instruction.
- Location: `test-profile-fix.js`
- Current message shown: `Run: npx supabase login`

**Proposed task:**
- Update script comments/output so setup steps match actual behavior (e.g., explain that a valid user session/token is required for `getUser`, or add explicit scripted sign-in flow instructions).
- Clarify whether this is intended as a manual integration script vs an automated test.

**Acceptance criteria:**
- Setup guidance in comments and runtime messages reflects the real authentication requirements of the script.
- A developer can follow the instructions without being sent to irrelevant CLI-login steps.

---

## 4) Test improvement task
**Issue found:** `test-profile-fix.js` is a manual script with console output and no assertions integrated into the project test runner, making regressions hard to catch in CI.
- Location: `test-profile-fix.js`

**Proposed task:**
- Add automated tests (e.g., Vitest/Jest) around profile-save logic by extracting the profile update workflow into a testable function/module.
- Mock Supabase client methods to assert expected behavior for success and failure paths (read error, upsert error, metadata update warning).

**Acceptance criteria:**
- Test cases run via the project test command and fail on regression.
- At minimum, cover: successful profile save path, upsert failure path, and missing-auth/session path.
