# Supabase Edge Functions Manifest

This checklist tracks production server-only functions and their deployment requirements.

## Deployment prerequisites

Set these environment variables in your shell or CI before deploy:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Then authenticate and deploy with explicit function names:

```bash
supabase login --token "$SUPABASE_ACCESS_TOKEN"
supabase functions deploy payment-webhook --project-ref "$SUPABASE_PROJECT_REF"
supabase functions deploy admin-kyc-decision --project-ref "$SUPABASE_PROJECT_REF"
supabase functions deploy admin-balance-adjustment --project-ref "$SUPABASE_PROJECT_REF"
```

## Function checklist

| Function name | Trigger source | Required secrets | Idempotency strategy |
| --- | --- | --- | --- |
| `payment-webhook` | External payment provider callback (`POST /functions/v1/payment-webhook`) | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_WEBHOOK_SECRET` (or `PAYMENT_WEBHOOK_SECRET`), `WEBHOOK_ACTOR_USER_ID` | Reject duplicate `event_id` by checking `admin_actions.new_value.provider_event_id` before write |
| `admin-kyc-decision` | Admin dashboard/server API call (`POST /functions/v1/admin-kyc-decision`) | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Deduplicate by `idempotencyKey` / `x-idempotency-key` persisted in `admin_actions.new_value.idempotency_key` |
| `admin-balance-adjustment` | Admin dashboard/server API call (`POST /functions/v1/admin-balance-adjustment`) | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Deduplicate by `idempotencyKey` / `x-idempotency-key` persisted in `admin_actions.new_value.idempotency_key` |

## Notes

- These functions use `SUPABASE_SERVICE_ROLE_KEY` only inside Edge Functions and must never be imported into browser bundles.
- Every function emits structured JSON logs via `console.log(JSON.stringify(...))` for reliable filtering in Supabase logs.
