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

## Route sanity checklist (prevent link drift)

Run this quick checklist whenever changing `app/support/page.tsx`, adding a new support route, or renaming a support page:

1. **Extract all `/support/*` links from the hub** and confirm each has a matching `app/support/**/page.tsx` file.
2. **Verify route behavior for every linked destination**:
   - Keep the route page if it is still live, or
   - Redirect from the old path to a live route with Next.js `redirect()`, or
   - Update the hub `<Link href>` target to the live path.
3. **Confirm API dependencies** for each linked page continue to resolve under `app/api/support/**`.
4. **Run the contract script** before merging:

   ```bash
   npm run check:support-routes
   ```

5. **Spot-check in the browser** by opening `/support` and following every “Open/Details” CTA.

### Current audit result

- `app/support/page.tsx` links (`/support/contact`, `/support/tickets`, `/support/status`, `/support/community`) all map to implemented page routes under `app/support/**`.
- No missing support hub routes were found in this audit.
