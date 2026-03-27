# Shortlisted Feature Mini Specs

This document translates the roadmap shortlist into delivery-ready mini specs to reduce ambiguity and prevent scope creep.

## Shortlist

1. Swap execution safeguards (rate, slippage tolerance, minimum received)
2. Portfolio holdings filtering + sorting
3. Buy flow market impact visibility
4. Breakpoint contract unification across CSS + JS

---

## 1) Swap execution safeguards (rate, slippage tolerance, minimum received)

### User stories
- As a trader, I want to see the current quote rate and estimated receive amount before I confirm a swap so I can evaluate execution quality.
- As a trader, I want to set slippage tolerance within safe bounds so I can control acceptable execution drift.
- As a trader, I want the app to block stale quotes so I do not submit swaps on outdated pricing.
- As a trader, I want to clearly see “minimum received” in review and submit states so I understand my downside floor.

### Edge cases
- Quote expires while the user is on the review step.
- Asset pair has low liquidity and minimum received falls below threshold.
- User enters slippage outside min/max bounds.
- Wallet balance changes mid-flow due to another action.
- Network timeout fetching quote or submitting execution.

### Functional requirements
- Show quote rate, estimated receive, fee estimate, and quote expiry timestamp on input + review steps.
- Allow slippage tolerance input with validated bounds (e.g., 0.1%–5.0%).
- Compute/display minimum received from quote + slippage.
- Disable confirm/submit when quote is expired, validation fails, or minimum received cannot be honored.
- Require quote refresh before re-enabling submission.
- Persist user-entered slippage within the current session.

### Non-functional requirements
- **Performance:** quote refresh action should update UI within 500 ms p95 after API response; submit endpoint should return first status within 2 s p95.
- **Security:** enforce auth on quote/execute endpoints; validate asset symbols, decimals, and slippage server-side; reject tampered min-received values.
- **Accessibility:** all numeric inputs and validation messages must be keyboard accessible and screen-reader labeled; expired-quote warnings announced via ARIA live region.

### API / data model changes
- **API changes:**
  - Extend quote response with `quoteId`, `expiresAt`, `rate`, `estimatedReceive`, `minimumReceived`, `fees`, `marketImpactBps`.
  - Extend execute request payload with `quoteId`, `slippageBps`, `clientMinimumReceived`.
- **Data model changes:**
  - Store swap execution metadata in order/execution records: `quote_id`, `slippage_bps`, `minimum_received`, `quote_expires_at`.

### UX flows and states
- **Loading:** skeleton for quote panel; submit button shows spinner and is disabled.
- **Empty:** no quote yet (before pair/amount selection) with helper prompt.
- **Error:** inline error for quote failure; blocking banner for expired quote and retry CTA.
- **Success:** confirmation page shows executed rate, received amount, slippage used, and transaction reference.

### Tracking / analytics events
- `swap_quote_requested` (pair, input_amount)
- `swap_quote_received` (quote_id, latency_ms, expires_in_s)
- `swap_slippage_changed` (from_bps, to_bps)
- `swap_submit_blocked` (reason: stale_quote | invalid_slippage | min_receive_unmet)
- `swap_submitted` (quote_id, slippage_bps)
- `swap_succeeded` / `swap_failed` (error_code)

### Definition of done
- All requirements implemented on swap input + review + success flows.
- API contract updated and validated with typed schema.
- Unit/integration tests pass for quote expiry, slippage bounds, and submit gating.
- Accessibility checks pass for validation/error announcements.
- Product + QA sign-off on stale quote and minimum received behavior.

### Acceptance tests
- Given an active quote, when user proceeds to review, then quote rate and minimum received are visible and submit is enabled.
- Given an expired quote, when user attempts submit, then submission is blocked and refresh CTA appears.
- Given slippage outside bounds, when user blurs input, then validation error appears and submit stays disabled.
- Given successful execution, when user lands on success page, then executed amount and reference are shown.

### Explicit out of scope
- Advanced execution modes (TWAP, iceberg, limit swap).
- Cross-chain bridging and external DEX routing.
- Price alert subscriptions.
- Historical swap analytics dashboard.

---

## 2) Portfolio holdings filtering + sorting

### User stories
- As an investor, I want to filter holdings by symbol/name so I can quickly find specific assets.
- As an investor, I want to sort holdings by allocation, value, and PnL so I can prioritize review.
- As an investor, I want to reset filters/sorts in one action.

### Edge cases
- Empty portfolio.
- Filter term matches no assets.
- Equal sort values requiring stable tiebreak behavior.
- Extremely large holdings list (pagination/virtualization boundary).

### Functional requirements
- Provide text filter (symbol/name) with debounce.
- Provide sortable columns: allocation %, market value, unrealized PnL.
- Show active filter and sort chips/labels.
- Add one-click reset returning default sort.
- Preserve filter/sort in URL query params for sharable state.

### Non-functional requirements
- **Performance:** filter/sort interaction response <100 ms for up to 1,000 rows on client; server query fallback <400 ms p95.
- **Security:** only authenticated user’s holdings can be queried; query params sanitized to whitelist allowed sort fields.
- **Accessibility:** sortable headers expose ARIA sort state; filter input has accessible label and clear button keyboard support.

### API / data model changes
- **API changes:**
  - Support optional query params: `search`, `sortBy`, `sortDir`, `limit`, `cursor` on holdings endpoint.
- **Data model changes:** none required if holdings view already has allocation/value/PnL fields; add index only if query plan regresses.

### UX flows and states
- **Loading:** table skeleton rows; maintain header visibility.
- **Empty:** dedicated empty state for “no holdings yet.”
- **Error:** inline table error with retry.
- **Success:** populated table with sort indicators and active filters.

### Tracking / analytics events
- `holdings_filter_applied` (search_term_length)
- `holdings_sort_changed` (sort_by, sort_dir)
- `holdings_filter_reset`
- `holdings_empty_state_viewed` (reason: no_data | no_match)

### Definition of done
- Filter and sorting controls available on portfolio holdings table.
- URL state + reset behavior verified.
- Automated tests cover sort correctness and empty/no-match states.
- Accessibility checks for header sort semantics completed.

### Acceptance tests
- Given populated holdings, when user sorts by PnL descending, then rows appear in correct order.
- Given filter term with no matches, then “no matching assets” empty state is shown.
- Given active filter/sort, when user refreshes page, then state is restored from URL.
- Given reset action, then default sorting and full list are restored.

### Explicit out of scope
- Saved custom views and per-user column personalization.
- Multi-field advanced query builder.
- Export enhancements beyond current CSV/PDF behavior.

---

## 3) Buy flow market impact visibility

### User stories
- As a buyer, I want to see estimated market impact before I place an order so I can decide whether to adjust size.
- As a buyer, I want to see impact consistently in input and review steps.
- As a buyer, I want prominent warning styling when impact is high.

### Edge cases
- Market impact API unavailable.
- Tiny notional where impact rounds to zero.
- Large order where impact breaches warning/critical threshold.
- Asset temporarily halted/unavailable for impact calculation.

### Functional requirements
- Show market impact estimate (% and estimated cost) on buy input step.
- Carry and re-display impact details on review step.
- Define warning threshold (e.g., >=1.0%) and critical threshold (e.g., >=3.0%) with clear visual hierarchy.
- Block submit for critical threshold only if business rules require hard-stop; otherwise require explicit user acknowledgment.
- Fallback messaging when impact estimate is unavailable.

### Non-functional requirements
- **Performance:** impact estimate updates within 400 ms p95 after amount change debounce.
- **Security:** validate order amount/asset and authorization server-side; never trust client-provided impact value during submit.
- **Accessibility:** warning/critical messages use icon + text (not color-only) and are screen-reader announced.

### API / data model changes
- **API changes:**
  - Ensure market impact endpoint returns `impactPct`, `impactCost`, `liquidityTier`, `asOf`.
  - Add optional submit payload field `impactAcknowledged` when warning threshold exceeded.
- **Data model changes:**
  - Persist `impact_pct_snapshot` and `impact_cost_snapshot` in order audit metadata.

### UX flows and states
- **Loading:** compact shimmer on impact row while recalculating.
- **Empty:** placeholder text before amount entry.
- **Error:** non-blocking inline message (“Impact unavailable, order can proceed”) unless policy requires blocking.
- **Success:** order confirmation includes final impact snapshot used at placement.

### Tracking / analytics events
- `buy_impact_requested` (asset, amount)
- `buy_impact_received` (impact_pct, latency_ms)
- `buy_impact_warning_shown` (threshold)
- `buy_impact_acknowledged`
- `buy_order_submitted` (impact_pct_snapshot)

### Definition of done
- Impact surfaced in buy input and review steps with threshold styling.
- Backend contract verified for impact response fields.
- Tests cover low/medium/high impact behaviors and unavailable service fallback.
- Product sign-off on threshold copy and warning semantics.

### Acceptance tests
- Given a moderate order, when impact is returned, then value appears in input and review with neutral styling.
- Given high impact above warning threshold, then warning UI appears and can be acknowledged.
- Given impact service error, then fallback message appears without app crash.
- Given successful submit, then order confirmation displays impact snapshot.

### Explicit out of scope
- Smart order routing to minimize impact.
- Predictive slippage simulator across venues.
- Real-time depth chart integration.

---

## 4) Breakpoint contract unification across CSS + JS

### User stories
- As a user, I want consistent responsive behavior across pages so components don’t jump unpredictably.
- As a developer, I want one canonical breakpoint source so CSS and JS logic stay aligned.

### Edge cases
- Browser zoom causing fractional viewport widths around breakpoint boundaries.
- SSR hydration mismatch when JS breakpoint differs from CSS media query.
- Embedded components using legacy hardcoded breakpoint constants.

### Functional requirements
- Define canonical breakpoint tokens (`sm`, `md`, `lg`, `xl`, `2xl`) as CSS custom properties.
- Update JS breakpoint hook/config to consume the same canonical values.
- Expose `data-breakpoint` attributes based on canonical thresholds for debugging/testing.
- Replace known hardcoded breakpoint values in targeted dashboard/shell components.

### Non-functional requirements
- **Performance:** no additional layout thrash from breakpoint observers; limit resize handler work and debounce appropriately.
- **Security:** not applicable beyond standard client hardening.
- **Accessibility:** responsive changes preserve focus order and don’t hide critical actions without equivalent access.

### API / data model changes
- **API changes:** none.
- **Data model changes:** none.

### UX flows and states
- **Loading:** not applicable.
- **Empty:** not applicable.
- **Error:** fallback to default breakpoint set if token read fails (log diagnostic event).
- **Success:** consistent behavior at boundary widths across nav, sidebar, and dashboard layouts.

### Tracking / analytics events
- `breakpoint_mismatch_detected` (css_bp, js_bp, viewport)
- `responsive_nav_mode_changed` (from, to)

### Definition of done
- Canonical breakpoint contract documented and implemented in CSS + JS.
- Legacy hardcoded breakpoints removed from scoped components.
- Cross-device QA pass completed for mobile/tablet/desktop with no mismatch defects.
- Regression tests/assertions added for breakpoint mapping utility.

### Acceptance tests
- Given viewport widths at each boundary, CSS and JS report identical breakpoint labels.
- Given resize across boundaries, navigation/sidebar transitions occur once with no flicker loop.
- Given SSR render then hydration, no breakpoint mismatch warning is logged.

### Explicit out of scope
- Full design-system token migration outside breakpoint constants.
- Rebuilding every legacy page for responsiveness in this initiative.
- New component library adoption.

---

## Dependencies and sequencing

1. Breakpoint contract unification (foundation for stable responsive behavior)
2. Swap safeguards and Buy impact visibility (trading flow safety + clarity)
3. Holdings filter/sort (portfolio UX enhancement)

## Cross-feature risks and mitigations

- **Risk:** stale market data causes inconsistent quote/impact behavior.
  - **Mitigation:** include `asOf`/`expiresAt` metadata and strict submit gating.
- **Risk:** UI state explosion across loading/error/success paths.
  - **Mitigation:** shared transactional-state components and explicit test matrix.
- **Risk:** analytics noise from high-frequency interactions.
  - **Mitigation:** debounce event emissions and document event contracts.
