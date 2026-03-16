# Route Inventory

This inventory tracks sidebar navigation coverage and whether each destination is currently live, redirected, or planned.

## Sidebar Route Status

| Sidebar section | Sidebar item | Route | Status | Decision |
| --- | --- | --- | --- | --- |
| Dashboard Overview | Dashboard Home | `/dashboard` | `live` | Existing dashboard landing page. |
| Portfolio Management | My Portfolio | `/dashboard/portfolio` | `live` | Existing page kept live. |
| Portfolio Management | Add Funds | `/dashboard/deposit` | `live` | Existing flow kept live. |
| Portfolio Management | Withdraw Funds | `/wallets/withdraw` | `live` | Existing wallets route kept live. |
| Market Insights | Market Overview | `/dashboard/market` | `live` | Implemented a dedicated dashboard market page now. |
| Market Insights | Top Gainers and Losers | `/dashboard/market/gainers-losers` | `live` | Implemented a dedicated movers page now. |
| Market Insights | Market News | `/tools/market-news` | `live` | Existing market news page kept live. |
| Trading Tools | Trade Now | `/dashboard/trade` | `live` | Existing trade page kept live. |
| Trading Tools | Order History | `/dashboard/orders` | `live` | Existing orders page kept live. |
| Trading Tools | Trading Strategies | `/dashboard/strategies` | `live` | Implemented a dedicated dashboard strategies page now. |
| Account Settings | Profile Settings | `/settings` | `live` | Existing settings page kept live. |
| Account Settings | Notifications | `/notifications` | `live` | Existing notifications page kept live. |
| Account Settings | Security Settings | `/profile/kyc` | `live` | Existing KYC/security route kept live. |
| Help and Support | FAQ | `/support/faqs` | `live` | Existing FAQ page kept live. |
| Help and Support | Contact Support | `/support` | `live` | Existing support landing page kept live. |
| Help and Support | Community Forum | `/support/community` | `live` | Existing community page kept live. |

## Status Legend

- `live`: The sidebar route has a dedicated page that users can navigate to.
- `redirected`: The sidebar route is intentionally forwarded to a different canonical route.
- `planned`: The sidebar route is intentionally hidden or deferred until implementation.
