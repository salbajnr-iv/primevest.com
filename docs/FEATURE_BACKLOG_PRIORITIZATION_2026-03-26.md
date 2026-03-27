# Feature Backlog Prioritization — 2026-03-26

## Inputs reviewed

### 1) Product notes
- `docs/IMPLEMENTATION_PLAN.md` highlights unresolved UX gaps in portfolio/trading feedback (fees/slippage/breakdowns) and KYC status/progress clarity.

### 2) Support ticket signals
- `docs/RELEASE_SIGNOFF_2026-03-18.md` reports support ticket APIs returning `503` in the tested environment (support flow non-functional in test env).
- `docs/TASK_PLAN.md` rates `/support/tickets` as functionally dense with inconsistent controls and marks it P1 for UX normalization.

### 3) Analytics pain points
- `docs/RELEASE_SIGNOFF_2026-03-18.md` flags a realtime disconnect/retry handling gap and only partial observability verification.
- `docs/IMPLEMENTATION_PLAN.md` and `docs/TASK_PLAN.md` emphasize inconsistent UX patterns and fragmented high-intent flows (buy/sell/deposit), which typically reduce activation/completion.

### 4) Stakeholder requests
- `docs/TASK_PLAN.md` provides canonical owners, priorities, and acceptance criteria for swap safeguards, holdings filtering/sorting, and market-impact visibility.
- `docs/backend-api-ownership.md` requests convergence of privileged financial/compliance writes to Edge Functions and migration of user-scoped support reads/writes away from service-role access.

---

## Candidate feature backlog

Scoring model used: **Priority Score = (Impact × Confidence) ÷ Effort**
- Impact: 1–5
- Confidence: 0.5–1.0
- Effort: 1–5 (proxy for complexity)

| # | Candidate feature | User problem + target persona | Business impact | Complexity (S/M/L + effort pts) | Dependencies | Success metric | Rollout risk | Impact | Confidence | Effort | Score |
|---:|---|---|---|---|---|---|---|---:|---:|---:|---:|
| 1 | **Stabilize support ticket reliability + RLS migration** | **Problem:** users cannot reliably create/view tickets when support backend is unavailable; trust drops after failed help requests. **Persona:** existing funded customers needing urgent help. | Retention, ops efficiency (fewer manual escalations), compliance/audit reliability. | **M/L (5)** | Supabase env/config parity, API route changes for RLS ownership, support DB tables, QA regression matrix. | Support API availability ≥99.5%; ticket create success rate; median first-response SLA. | Medium-high: auth/permission regressions during service-role→RLS migration. | 5 | 0.8 | 5 | 0.80 |
| 2 | **Swap safeguards v2 (quote freshness, slippage controls, minimum received guardrails)** | **Problem:** users risk poor execution due to stale quotes/unclear slippage and minimum receive terms. **Persona:** active traders and high-frequency dashboard users. | Revenue (trade completion quality), retention (reduced failed/trust-eroding swaps), risk reduction. | **M (3)** | Quote engine freshness checks, UI controls/validation, possibly external pricing API reliability. | Swap success rate; stale-quote rejection rate; reduced post-trade complaint volume. | Medium: stricter validation can temporarily reduce conversion if messaging is weak. | 5 | 0.85 | 3 | 1.42 |
| 3 | **Buy flow market-impact transparency (input + review + threshold warnings)** | **Problem:** users do not see explicit market impact, causing surprise outcomes and abandonment. **Persona:** new and intermediate buyers. | Activation + revenue (higher confidence to submit), reduced support contacts about pricing outcomes. | **M (3)** | Market-impact estimator API/RPC, UI warning states, copy/design approval. | Buy-step completion rate; review→submit conversion; market-impact warning acknowledgment. | Low-medium: model quality/latency can affect trust if inconsistent. | 4 | 0.85 | 3 | 1.13 |
| 4 | **KYC multi-step progress + status UX** | **Problem:** current KYC feels linear/opaque with weak status communication. **Persona:** newly registered users trying to activate trading access. | Activation (faster verified users), retention, compliance ops efficiency (fewer status inquiries). | **M (3)** | KYC request/status APIs, document upload UX, compliance/legal copy and status taxonomy. | KYC completion rate; time-to-verification; % of users progressing each KYC step. | Medium: compliance wording/flow mistakes can increase rejection rates. | 5 | 0.8 | 3 | 1.33 |
| 5 | **Portfolio holdings filtering/sorting (symbol, allocation, value, PnL)** | **Problem:** users cannot quickly locate or rank holdings in dense portfolios. **Persona:** returning investors with multi-asset portfolios. | Retention/engagement (more useful daily dashboard), lower analysis friction. | **S/M (2)** | Frontend table controls, query/sort support, interaction design for resetable filters. | Portfolio session depth; filter/sort usage rate; reduced time-to-find-asset. | Low: mostly UI/state complexity. | 3 | 0.9 | 2 | 1.35 |
| 6 | **Observability hardening (realtime disconnect/retry alerts + ingestion failure monitoring UX)** | **Problem:** teams cannot quickly detect/diagnose realtime and ingestion issues; incidents prolong user-facing degradation. **Persona:** internal ops/SRE + product on-call. | Ops efficiency, retention (faster incident recovery), reduced downtime impact. | **M/L (4)** | Logging/alerts pipeline, status endpoints, incident dashboards, cron/webhook instrumentation. | MTTR; alert precision/recall; % incidents detected before user reports. | Medium: noisy alerts can overwhelm on-call, hiding true incidents. | 4 | 0.75 | 4 | 0.75 |
| 7 | **Privileged write-path consolidation to Edge Functions (orders/swap/wallet/KYC/admin mutations)** | **Problem:** critical financial/compliance workflows are split across route handlers, raising risk for idempotency/audit drift. **Persona:** platform engineering + risk/compliance; indirect user benefit via reliability. | Risk reduction, compliance posture, long-term ops efficiency, incident reduction. | **L (5)** | Supabase Edge Functions, auth strategy, idempotency keys, auditing standards, migration choreography, legal/compliance review. | Financial workflow error rate; duplicate/partial-write incidents; audit completeness score. | High: migration complexity across sensitive money/compliance flows. | 5 | 0.7 | 5 | 0.70 |

---

## Ranked backlog (by score)

1. **Swap safeguards v2** — score **1.42**
2. **Portfolio holdings filtering/sorting** — score **1.35**
3. **KYC multi-step progress + status UX** — score **1.33**
4. **Buy flow market-impact transparency** — score **1.13**
5. **Support ticket reliability + RLS migration** — score **0.80**
6. **Observability hardening** — score **0.75**
7. **Privileged write-path Edge Function consolidation** — score **0.70**

> Note: Items 5–7 have lower score due to higher effort/risk, but may still be mandatory for platform safety/compliance sequencing.

---

## Top 5 shortlist for implementation (recommended)

### 1) Swap safeguards v2
- **Why now:** highest weighted value; direct effect on high-intent trading outcomes and trust.
- **Recommended rollout:** behind feature flag for 10%→50%→100% cohorts with conversion + error monitoring.

### 2) Portfolio holdings filtering/sorting
- **Why now:** fast win with low-medium effort and clear engagement upside.
- **Recommended rollout:** full release once keyboard/mobile filtering and reset behavior pass QA.

### 3) KYC multi-step progress + status UX
- **Why now:** strong activation lever and support deflection opportunity.
- **Recommended rollout:** staged release by geography/compliance profile to validate drop-off changes.

### 4) Buy flow market-impact transparency
- **Why now:** complements swap safeguards, improves pricing transparency and conversion confidence.
- **Recommended rollout:** first release with read-only impact labels, then warning thresholds in phase 2.

### 5) Support ticket reliability + RLS migration
- **Why now:** lower score but operationally urgent because support failures directly harm retention and trust.
- **Recommended rollout:** reliability fixes first (503 elimination), then permission-model migration with shadow validation.

---

## Suggested sequencing (next 2 sprints)

- **Sprint A (value + speed):**
  1. Portfolio holdings filtering/sorting
  2. Buy flow market-impact transparency
  3. Swap safeguards v2 (phase 1)

- **Sprint B (activation + reliability):**
  1. KYC multi-step progress + status UX
  2. Swap safeguards v2 (phase 2 guardrails)
  3. Support ticket reliability baseline fix (followed by RLS migration hardening)
