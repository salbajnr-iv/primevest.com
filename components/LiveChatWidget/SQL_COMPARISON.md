# Live Chat Widget - SQL Setup & Comparison

## Overview
Three SQL setup files are provided for different use cases:

### Files
1. **SETUP.sql** — Complete, production-ready setup with extensive comments
2. **SETUP_MINIMAL.sql** — Minimal version for quick reference
3. **supabase/migrations/** — Migration files for Supabase version control

---

## Quick Start

### Option 1: Supabase Dashboard
1. Go to **SQL Editor** in your Supabase Dashboard
2. Create new query
3. Copy entire contents of `SETUP.sql`
4. Run

### Option 2: Supabase CLI
```bash
supabase db push
```
(Automatically applies migrations from `supabase/migrations/`)

### Option 3: psql (direct Postgres)
```bash
psql "postgresql://[user]:[password]@[host]:[port]/[database]" < SETUP.sql
```

---

## Schema Overview

### Tables

#### chat_conversations
Stores visitor chat sessions.

```
id                uuid (PK)
visitor_user_id   uuid (FK to auth.users)
page_url          text
referrer_url      text
created_at        timestamp
updated_at        timestamp
```

#### chat_messages
Stores individual messages.

```
id                uuid (PK)
conversation_id   uuid (FK to chat_conversations)
user_id           uuid (FK to auth.users)
user_role         enum: 'user' | 'admin'
content           text (max 10000 chars)
message_type      enum: 'text'
page_url          text
client_message_id uuid (for deduplication)
created_at        timestamp
```

#### admin_users
Stores admin user IDs for authorization.

```
id                uuid (PK)
user_id           uuid (FK to auth.users, UNIQUE)
created_at        timestamp
updated_at        timestamp
```

---

## RLS Policy Summary

| Table | Policy | Role | Operation | Condition |
|-------|--------|------|-----------|-----------|
| chat_conversations | "Users can view own conversations" | authenticated | SELECT | `visitor_user_id = auth.uid()` |
| chat_conversations | "Users can create conversations" | authenticated | INSERT | `visitor_user_id = auth.uid()` |
| chat_messages | "Users can view conversation messages" | authenticated | SELECT | In own conversation OR is admin |
| chat_messages | "Users can send messages" | authenticated | INSERT | In own conversation, `user_role = 'user'` |
| chat_messages | "Admins can send messages" | authenticated | INSERT | In `admin_users` table, `user_role = 'admin'` |
| admin_users | "Admins can view admin users" | authenticated | SELECT | Is admin |

---

## Realtime Trigger

**Trigger Name:** `broadcast_chat_insert_to_conversation`

**On:** INSERT to `chat_messages`

**Action:** Broadcasts to channel `chat:<conversation_id>` with event `INSERT`

**Payload:**
```json
{
  "type": "broadcast",
  "event": "INSERT",
  "schema": "public",
  "table": "chat_messages",
  "commit_timestamp": 1234567890000,
  "new": { ... message row ... },
  "old": null
}
```

**Frontend Subscription:**
```typescript
supabase.channel('chat:' + conversationId)
  .on('broadcast', { event: 'INSERT' }, (payload) => {
    // Handle new message
  })
  .subscribe()
```

---

## Utility Functions

### is_admin(user_id UUID)
Checks if a user is an admin.

```sql
SELECT public.is_admin('550e8400-e29b-41d4-a716-446655440000');
-- Returns: true | false
```

### get_or_create_conversation(visitor_user_id, page_url?, referrer_url?)
Gets existing conversation or creates new one.

```sql
SELECT public.get_or_create_conversation(
  '550e8400-e29b-41d4-a716-446655440000',
  'https://example.com/page',
  'https://google.com'
);
-- Returns: conversation_id (uuid)
```

### get_user_recent_conversations(user_id, limit?)
Gets recent conversations for a user.

```sql
SELECT * FROM public.get_user_recent_conversations(
  '550e8400-e29b-41d4-a716-446655440000',
  10
);
```

### get_user_conversation_count(user_id)
Counts conversations for a user.

```sql
SELECT public.get_user_conversation_count('550e8400-e29b-41d4-a716-446655440000');
-- Returns: 5
```

---

## Frontend Integration Points

### 1. Create/Get Conversation
**Frontend:** `handleOpen()` calls `ensureConversationExists(userId)`

**Backend:** Uses `get_or_create_conversation()` SQL function or direct INSERT with RLS

**Result:** `conversation_id` returned to frontend

### 2. Load Initial Messages
**Frontend:** Fetches messages via `supabase.from('chat_messages').select('*').eq('conversation_id', convId)`

**Backend:** RLS policy checks `visitor_user_id = auth.uid()` or `is_admin(auth.uid())`

**Result:** Message history returned to frontend

### 3. Subscribe to Realtime
**Frontend:** Opens channel `chat:<conversation_id>` listening for INSERT

**Backend:** Trigger fires on new INSERT, broadcasts to channel

**Result:** New messages received in real-time

### 4. Send Message
**Frontend:**
1. Generates `client_message_id` (UUID)
2. Inserts to `chat_messages` with `user_role = 'user'`
3. Optimistic UI update

**Backend:**
1. RLS checks pass
2. Row inserted to DB
3. Trigger fires → broadcasts to channel

**Result:** Message visible in all subscribed clients within ~100ms

---

## Admin Setup

To add an admin user:

```sql
INSERT INTO public.admin_users (user_id)
VALUES ('550e8400-e29b-41d4-a716-446655440000');
```

Admin features:
- ✅ Can view ALL messages (not just own conversations)
- ✅ Can send `user_role = 'admin'` messages
- ✅ RLS enforces via `admin_users` table lookup (not JWT claims)

---

## Security Model

### Authorization (NOT JWT Claims)
- ✅ **Visitor access:** Tied to conversations where `visitor_user_id = auth.uid()`
- ✅ **Admin access:** Verified via lookup in `admin_users` table
- ❌ **NOT used:** `user_role` JWT claim (RLS doesn't trust frontend values)
- ❌ **NOT used:** service_role key (frontend never uses it)

### Message Limits
- Max length: 10,000 characters
- Rate limiting: Add via custom RLS function (recommended)
- Retry deduplication: `client_message_id` UNIQUE constraint

### Privacy
- Users only see messages in their conversations
- Admins see all messages
- Anon users supported via `supabase.auth.signInAnonymously()`

---

## Testing Helper Queries

### View all conversations for a user
```sql
SELECT * FROM public.chat_conversations
WHERE visitor_user_id = auth.uid()
ORDER BY created_at DESC;
```

### View all messages in a conversation
```sql
SELECT * FROM public.chat_messages
WHERE conversation_id = '...'
ORDER BY created_at ASC;
```

### Verify RLS policies work
```sql
-- As authenticated user, should see own messages
SELECT * FROM public.chat_messages
WHERE conversation_id = (
  SELECT id FROM public.chat_conversations
  WHERE visitor_user_id = auth.uid()
  LIMIT 1
);
```

### Check admin status
```sql
SELECT public.is_admin(auth.uid());
```

---

## Troubleshooting

| Issue | SQL Check |
|-------|-----------|
| Messages not loading | Check RLS: `SELECT * FROM public.chat_messages;` (should filter by user) |
| Can't insert message | Verify: `SELECT EXISTS(SELECT 1 FROM admin_users WHERE user_id = auth.uid());` |
| Realtime not working | Confirm: `ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;` |
| Duplicate messages | Check: `SELECT COUNT(*) FROM chat_messages WHERE client_message_id IS NOT NULL AND client_message_id = '...';` |

---

## File Usage Guide

| File | Use Case | Audience |
|------|----------|----------|
| SETUP.sql | **Production setup** with full docs | Database admins |
| SETUP_MINIMAL.sql | Quick reference, copy-paste | Developers |
| 001_create_live_chat_tables.sql | Version control via Supabase CLI | DevOps, version control |
| 002_create_live_chat_triggers_functions.sql | Separate trigger/function migration | Version control, rollback |

---

## Next Steps

1. ✅ Run SQL setup via Supabase Dashboard or CLI
2. ✅ Add test admin: `INSERT INTO admin_users (user_id) VALUES ('...');`
3. ✅ Add `LiveChatWidget` to `app/layout.tsx`
4. ✅ Set `.env.local` with Supabase credentials
5. ✅ Test: Open widget, send message, verify in Supabase
6. ✅ Test Realtime: Open widget in 2 tabs, send from tab 1, verify in tab 2

---

## Migration Path

If Supabase backend already exists:

1. **Check existing schema:** Query `information_schema.tables`
2. **Compare with SETUP.sql:** Ensure tables, RLS, triggers match
3. **Apply diffs:** Run only missing CREATE/ALTER statements
4. **Verify:** Run test queries above

---
