# PrimeVest — Financial Trading Platform

## Project Overview
PrimeVest is a Next.js 16.1.1 financial trading and investment platform. It was migrated from Vercel to Replit and uses Supabase for authentication, database, and real-time features.

## Tech Stack
- **Framework**: Next.js 16.1.1 (webpack mode), React 19.2.3
- **Auth / DB / Realtime**: Supabase (SSR + JS client)
- **Package manager**: npm
- **Dev server**: `next dev --webpack -p 5000 -H 0.0.0.0`

## Key Configuration
- Port: 5000, bound to 0.0.0.0 for Replit compatibility
- `next.config.ts`: `allowedDevOrigins: ['*.replit.dev']`
- Middleware in `middleware.ts` (deprecated in Next.js 16 — non-blocking warning)

## Supabase Tables (Required)
| Table | Purpose |
|---|---|
| `profiles` | User profiles with `is_admin` flag |
| `wallets` | User wallet records |
| `balances` | Per-user per-asset balances |
| `orders` | Trade orders |
| `notifications` | User notifications |
| `market_prices` | Market prices ingested from CoinGecko |
| `asset_snapshots` | Asset price snapshots |
| `support_tickets` | Support ticket system |
| `support_ticket_replies` | Support ticket replies |
| `chat_conversations` | Live chat conversations (requires auth) |
| `chat_messages` | Live chat messages with real-time |

### Live Chat Supabase Setup
Run `components/LiveChatWidget/SETUP_MINIMAL.sql` in the Supabase SQL editor to create the chat tables, RLS policies, and enable real-time. Key line: `ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;`

## Architecture

### Real-time Features
All real-time updates use `postgres_changes` subscriptions (not Broadcast):
- `lib/supabase/realtime.ts` — shared hooks: `useBalanceRealtime`, `useMarketPriceRealtime`, `useOrderStatusRealtime`, `useSupportTicketRepliesRealtime`, etc.
- `components/LiveChatWidget/LiveChatWidget.tsx` — live chat with `postgres_changes` on `chat_messages` filtered by `conversation_id`
- `app/wallets/page.tsx` — subscribes to `wallets` and `balances` tables
- `app/dashboard/portfolio/page.tsx` — subscribes to `balances` and `orders` tables

### Live Chat Widget
- **Widget**: `components/LiveChatWidget/LiveChatWidget.tsx`
- **UI Components**: `components/ui/chat/ChatInput.tsx`, `MessageBubble.tsx`, `MessageList.tsx`
- **Types**: `components/LiveChatWidget/types.ts`
- **Setup SQL**: `components/LiveChatWidget/SETUP_MINIMAL.sql`
- **How it works**: Requires authenticated user (uses Supabase `auth.uid()` as visitor ID). Opens a conversation in `chat_conversations`, sends messages to `chat_messages`, real-time updates via `postgres_changes`.

### API Routes
All under `app/api/`:
- `/api/portfolio` — user portfolio with holdings
- `/api/wallets` — wallet list
- `/api/wallets/balances` — wallet balances
- `/api/dashboard/*` — dashboard aggregates, performance data
- `/api/auth/session` — session management
- `/api/market-prices` — market price ingestion from CoinGecko

### Authentication
- Supabase SSR auth via `@supabase/ssr`
- `contexts/AuthContext.tsx` — main user auth context
- `contexts/AdminAuthContext.tsx` — admin-specific auth with inactivity timeout
- `lib/auth/service.ts` — auth service functions
- `lib/auth/session-manager.ts` — session monitoring

## Known Issues / Notes
- `middleware.ts` uses the deprecated file name (should be `proxy.ts` in Next.js 16) — non-breaking warning only
- Live chat requires Supabase tables to be created via the setup SQL
- External image URLs from Storyblok CDN used for homepage sections
