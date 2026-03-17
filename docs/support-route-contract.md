# Support route contract checklist

This checklist documents and validates the contract between:

- Support hub links in `app/support/page.tsx`
- Implemented pages under `app/support/**`
- Backing API handlers under `app/api/support/**`

Validation is enforced by `scripts/check-support-route-contract.mjs`.

## Hub links (baseline)

- `/support/contact`
- `/support/tickets`
- `/support/status`
- `/support/community`

## Route to API mapping (baseline)

| Support route | Implemented page | Backing API routes |
| --- | --- | --- |
| `/support/contact` | `app/support/contact/page.tsx` | `/api/support/contact` |
| `/support/tickets` | `app/support/tickets/page.tsx` | `/api/support/tickets`, `/api/support/tickets/[id]`, `/api/support/tickets/[id]/reply` |
| `/support/status` | `app/support/status/page.tsx` | `/api/support/status` |
| `/support/community` | `app/support/community/page.tsx` | `/api/support/community` |
| `/support/faqs` | `app/support/faqs/page.tsx` | _none_ |

## CI/Lint enforcement

Run:

```bash
npm run check:support-routes
```

The check fails when any support hub link points to a missing page route.
