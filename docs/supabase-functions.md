# Supabase Edge Functions Manifest

This checklist tracks production server-only functions and their deployment requirements.

## Deployment prerequisites

Set these environment variables in your shell or CI before deploy:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Edge-function specific secrets:

- `STRIPE_WEBHOOK_SECRET` or `PAYMENT_WEBHOOK_SECRET`
- `KYC_WEBHOOK_SECRET`
- `WEBHOOK_ACTOR_USER_ID`

Then authenticate and deploy with explicit function names:

```bash
supabase login --token "$SUPABASE_ACCESS_TOKEN"
supabase functions deploy payment-webhook --project-ref "$SUPABASE_PROJECT_REF"
supabase functions deploy kyc-provider-callback --project-ref "$SUPABASE_PROJECT_REF"
supabase functions deploy admin-kyc-decision --project-ref "$SUPABASE_PROJECT_REF"
supabase functions deploy admin-balance-adjustment --project-ref "$SUPABASE_PROJECT_REF"
supabase functions deploy admin-maintenance-batch --project-ref "$SUPABASE_PROJECT_REF"
```

## Function checklist

| Function name | Trigger source | Required secrets | Replay-safe strategy |
| --- | --- | --- | --- |
| `payment-webhook` | External payment provider callback (`POST /functions/v1/payment-webhook`) | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_WEBHOOK_SECRET` (or `PAYMENT_WEBHOOK_SECRET`), `WEBHOOK_ACTOR_USER_ID` | Claim `async_task_replays(task_type='payment_webhook', replay_key=event_id)` before side effects; duplicates return prior result/in-progress |
| `kyc-provider-callback` | External KYC provider callback (`POST /functions/v1/kyc-provider-callback`) | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `KYC_WEBHOOK_SECRET`, `WEBHOOK_ACTOR_USER_ID` | Claim `async_task_replays(task_type='kyc_provider_callback', replay_key=event_id)` before writing KYC status |
| `admin-kyc-decision` | Admin dashboard/server API call (`POST /functions/v1/admin-kyc-decision`) | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Deduplicate by `idempotencyKey` / `x-idempotency-key` persisted in `admin_actions.new_value.idempotency_key` |
| `admin-balance-adjustment` | Admin dashboard/server API call (`POST /functions/v1/admin-balance-adjustment`) | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Deduplicate by `idempotencyKey` / `x-idempotency-key` persisted in `admin_actions.new_value.idempotency_key` |
| `admin-maintenance-batch` | Admin dashboard/server API call (`POST /functions/v1/admin-maintenance-batch`) | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Claim `async_task_replays(task_type='admin_maintenance_batch', replay_key='<admin_id>:<idempotency_key>')` |

## API boundary updates

Sensitive service-role operations were moved out of Next.js route handlers:

- `POST /api/admin/kyc/review` now forwards authenticated requests to `admin-kyc-decision`.
- `POST /api/admin/simulate` now forwards authenticated requests to `admin-maintenance-batch`.
- `POST /api/kyc/provider-callback` forwards provider callbacks to `kyc-provider-callback`.

These API routes no longer perform direct service-role table writes.

## Notes

- `SUPABASE_SERVICE_ROLE_KEY` must stay scoped to Edge Functions only.
- Replay state lives in `public.async_task_replays` with unique `(task_type, replay_key)`.
- Every function emits structured JSON logs via `console.log(JSON.stringify(...))` for reliable filtering in Supabase logs.
