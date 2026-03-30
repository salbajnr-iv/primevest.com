# Live Chat Widget Integration Guide

## Overview
The `LiveChatWidget` component provides a floating chat interface that connects to Supabase for real-time message synchronization. Users can open a modal to view chat history and send messages, which are instantly visible to support staff through Realtime subscriptions.

**Supports both authenticated and anonymous users** — if no session exists, the component automatically signs in the user anonymously to ensure `auth.uid()` is always available for conversations and messages.

## Features
- ✅ Floating "Live Chat" button (fixed bottom-right)
- ✅ Modal with message list and input
- ✅ Real-time message sync via Supabase Realtime (private broadcast channels)
- ✅ Conversation management (auto-creates on first open)
- ✅ **Anonymous authentication** (auto sign-in if no session)
- ✅ Client message deduplication (UUID-based)
- ✅ Auto-scroll to latest messages
- ✅ Mobile-friendly responsive design
- ✅ Error handling and retry support
- ✅ Optimistic UI updates
- ✅ Automatic session refresh on send

## Installation & Setup

### 1. Environment Variables
Ensure these are set in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### 2. Supabase Tables

**chat_conversations**
```sql
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_user_id UUID NOT NULL REFERENCES auth.users(id),
  page_url TEXT,
  referrer_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**chat_messages**
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_role TEXT CHECK (user_role IN ('user', 'admin')),
  content TEXT NOT NULL CHECK (LENGTH(content) <= 10000),
  message_type TEXT DEFAULT 'text' CHECK (message_type = 'text'),
  page_url TEXT,
  client_message_id UUID UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**admin_users** (for authorization)
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Row-Level Security (RLS)

Enable RLS on all tables:
```sql
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
```

**RLS Policies for chat_conversations:**
```sql
-- Users can see their own conversations
CREATE POLICY "Users can view own conversations"
ON chat_conversations FOR SELECT
USING (auth.uid() = visitor_user_id);

-- Users can insert new conversations
CREATE POLICY "Users can create conversations"
ON chat_conversations FOR INSERT
WITH CHECK (auth.uid() = visitor_user_id);
```

**RLS Policies for chat_messages:**
```sql
-- Users can see messages in their conversations
CREATE POLICY "Users can view conversation messages"
ON chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_conversations
    WHERE chat_conversations.id = chat_messages.conversation_id
    AND chat_conversations.visitor_user_id = auth.uid()
  )
);

-- Users can insert messages
CREATE POLICY "Users can send messages"
ON chat_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_conversations
    WHERE chat_conversations.id = chat_messages.conversation_id
    AND chat_conversations.visitor_user_id = auth.uid()
  )
  AND user_id = auth.uid()
  AND user_role = 'user'
);

-- Admins can insert admin messages
CREATE POLICY "Admins can send messages"
ON chat_messages FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  AND user_role = 'admin'
);
```

### 4. Realtime & Database Triggers

Enable Realtime on `chat_messages` (in Supabase Dashboard: Tables → chat_messages → Realtime → Enable).

Create broadcast trigger:
```sql
CREATE TRIGGER broadcast_chat_insert
AFTER INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION realtime.broadcast_changes('chat:' || NEW.conversation_id, 'INSERT');
```

### 5. Add to Layout
Place in `app/layout.tsx`:

```tsx
import { AuthProvider } from '@/components/AuthProvider'
import { LiveChatWidget } from '@/components/LiveChatWidget'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
          <LiveChatWidget />
        </AuthProvider>
      </body>
    </html>
  )
}
```

## Component API

### Props
None required. Component is fully self-contained.

### State
- **isOpen** — Modal visibility
- **conversationId** — Current chat session ID
- **messages** — Message array
- **loading** — Initial load state
- **error** — Error message (auto-displays in UI)
- **isSending** — Message submission in progress

### Types

```tsx
interface ChatMessage {
  id: string
  conversation_id: string
  user_id: string
  user_role: 'user' | 'admin'
  content: string
  message_type: 'text'
  page_url?: string
  client_message_id?: string  // UUID for deduplication
  created_at: string
}

interface Conversation {
  id: string
  visitor_user_id: string
  page_url?: string
  referrer_url?: string
  created_at: string
}
```

## Workflow

### 1. Widget Opens
1. Get current session → `supabase.auth.getSession()`
2. **If no session**: Auto sign-in anonymously → `supabase.auth.signInAnonymously()`
3. Create or fetch existing conversation
4. Load initial messages from `chat_messages` table
5. Subscribe to Realtime channel `chat:<conversation_id>`

### 2. Send Message
1. Generate unique `client_message_id` (UUID)
2. Insert to `chat_messages` with:
   - `user_role = 'user'` (RLS enforces this)
   - `message_type = 'text'`
   - `client_message_id` (for dedup on retry)
3. Optimistic UI update (show immediately)
4. Database trigger broadcasts INSERT event
5. Realtime subscription receives payload and appends message

### 3. Admin Sends Message
1. Admin UI inserts to `chat_messages` with `user_role = 'admin'`
2. RLS checks: user must be in `admin_users` table
3. Trigger broadcasts to `chat:<conversation_id>`
4. Frontend receives and displays instantly

## Security Details

### Authorization
- ✅ **RLS enforces all access** — frontend `user_role` values are NOT trusted
- ✅ **Admin check** — admins determined by `admin_users` table, not JWT claims
- ✅ **Private channels** — Realtime `chat:<conversation_id>` enforces RLS
- ✅ **Anon auth OK** — anonymous users supported via Supabase anonymous sign-in

### Session Management
- **Automatic anonymous sign-in**: If no authenticated session, component signs in anonymously
- **Session token in Realtime**: SSR client auto-syncs session token for private channel auth
- **No manual `setAuth()` needed**: Token automatically used for Realtime authorization

### What NOT to Do
- ❌ Don't relay on JWT claims for authorization (use RLS + `admin_users` table)
- ❌ Don't expose service_role key in frontend
- ❌ Don't skip RLS checks on tables
- ❌ Don't trust client-submitted `user_role` values

## Features Explained

### Anonymous Authentication
- If user opens widget without logging in, component auto-calls `supabase.auth.signInAnonymously()`
- Ensures `auth.uid()` always exists for database operations
- Session persists in browser (via localStorage)
- Perfect for visitor support without forcing login

### Client Message Deduplication
- Each message gets unique UUID (`client_message_id`)
- Tracked in memory to prevent Realtime duplicates
- Persisted in DB to prevent duplicates on network retries
- Constraint: `UNIQUE(client_message_id)` prevents DB duplicates

### Optimistic Updates
- Message appears in UI immediately after send (before DB confirm)
- If DB insert fails → remove message & show error
- No network delay for user feedback

### Auto-scroll to Latest
- Scrolls to newest message on:
  - Initial load
  - New Realtime message received
  - After message sent
- Uses smooth scroll for better UX

### Error Handling
- Session error → "Session error. Please refresh and try again."
- Anon sign-in failed → "Failed to initialize chat"
- Message send failed → "Failed to send message. Please try again."
- Realtime connection failed → "Real-time connection failed"
- All errors logged to console for debugging

## Styling & Responsive Design

Uses project conventions:
- **Tailwind CSS v4** for responsive utilities
- **Radix UI** components (Button, Card, ChatInput, MessageBubble)
- **Lucide React** icons
- **Fixed positioning** (bottom-right, z-50)
- **Mobile**: Full-width modal with safe insets
- **Desktop**: 384px fixed width
- **Dark mode** support via theme context

## Testing Checklist

- [ ] Component renders, button visible
- [ ] Click button → modal opens
- [ ] First open (no auth) → anonymous sign-in succeeds
- [ ] Conversation created in DB with correct `visitor_user_id`
- [ ] Initial messages load and display
- [ ] Type & send message → appears in list
- [ ] Message in DB with `client_message_id`
- [ ] Open chat in 2 browser tabs
- [ ] Send from tab 1 → appears in tab 2 in ~1 sec
- [ ] Admin sends message → appears with `is_staff` styling
- [ ] Mobile: modal responsive, button positioned correctly
- [ ] Network fails → error displays, no crash
- [ ] Close widget → Realtime channel unsubscribes

## Performance Notes

- **Lazy Realtime**: Channel only subscribes when modal opens
- **Cleanup on unmount**: Unsubscribes & cancels pending operations
- **Message dedup O(1)**: Uses Set for fast lookup
- **Smooth scroll**: Non-blocking async scroll
- **Minimal renders**: React effect dependencies optimized

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "Failed to initialize chat" | Anon sign-in failed | Check Supabase auth settings, enable anon sign-in |
| Messages not loading | RLS denies SELECT | Verify RLS policies on chat_messages table |
| Realtime not syncing | Channel subscription failed | Check Realtime enabled on table, trigger created |
| Duplicate messages | `client_message_id` not unique | Verify DB constraint on chat_messages.client_message_id |
| Anon session expired | Session TTL reached | Users sign in again automatically on widget re-open |

## Future Enhancements (Deferred)

- [ ] Unread message badge
- [ ] Typing indicators
- [ ] Read receipts
- [ ] File attachments
- [ ] Message search
- [ ] Rate limiting per conversation
