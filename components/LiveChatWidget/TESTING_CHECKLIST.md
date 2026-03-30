# Live Chat Widget - Testing Checklist

## ✅ Backend Verification

### Database Setup

- [ ] **Run VERIFY_SETUP.sql** in Supabase SQL Editor
  - Copy [VERIFY_SETUP.sql](./VERIFY_SETUP.sql) into Supabase SQL Editor
  - Run the script and verify all checks pass:
    - ✓ Tables exist (chat_conversations, chat_messages, admin_users)
    - ✓ Columns are correct
    - ✓ RLS is enabled on all tables
    - ✓ RLS policies are in place (7 policies total)
    - ✓ Realtime is enabled on chat_messages
    - ✓ Triggers are set up
    - ✓ Functions are created

- [ ] **Verify Environment Variables** in `.env.local`
  - `NEXT_PUBLIC_SUPABASE_URL` ✓
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✓

## ✅ Frontend Integration

### Component Layout Integration

- [ ] **LiveChatWidget added to layout**
  - Import statement added to [app/layout.tsx](../../app/layout.tsx)
  - Component renders in layout bottom-right corner
  - No console errors on page load

### UI Component Verification

- [ ] **Floating button appears**
  - Icon: Message circle (blue)
  - Position: Fixed bottom-right corner (24px from edges)
  - Clickable and responsive to hover
  - Background: Blue accent color

- [ ] **Modal opens on button click**
  - Modal: 400px wide, dark theme
  - Header: "Live Chat Support" title + close button
  - Content: Empty message list
  - Input field: "Type a message..." placeholder
  - Send button: Blue "Send" button

## ✅ Functional Testing (Desktop)

### Session & Authentication

- [ ] **Test 1: Session Sign-In**
  1. Open http://localhost:3000
  2. Click floating chat button
  3. Modal opens
  4. (Check browser console for "Supabase auth sign-in" logs)
  5. ✓ Should auto-sign in anonymously

- [ ] **Test 2: Conversation Created**
  1. Check browser console for conversation ID
  2. Go to Supabase Dashboard → Editor → chat_conversations
  3. ✓ Should see one row with:
     - `visitor_user_id`: UUID (anonymous user)
     - `page_url`: Current page URL
     - `created_at`: Current timestamp

### Message Sending

- [ ] **Test 3: Send Message**
  1. Type "Hello admin!" in input field
  2. Click Send button
  3. Message appears immediately in chat (optimistic update)
  4. ✓ Message should show in blue bubble

- [ ] **Test 4: Message Persisted to DB**
  1. Go to Supabase Dashboard → chat_messages table
  2. ✓ Should see message with:
     - `conversation_id`: Matches earlier conversation
     - `user_id`: Current anonymous user ID
     - `user_role`: 'user' (not 'admin')
     - `content`: "Hello admin!"
     - `client_message_id`: UUID (deduplication key)

- [ ] **Test 5: Send Multiple Messages**
  1. Send 3-5 messages in sequence
  2. ✓ All appear in chat with correct order
  3. ✓ No duplicates (client deduplication working)
  4. ✓ All appear in DB with timestamps in order

### Realtime Sync (Two-Tab Test)

- [ ] **Test 6: Realtime Broadcast**
  1. Open http://localhost:3000 in **Tab A**
  2. Open http://localhost:3000 in **Tab B** (both with chat open)
  3. In Tab A: Send message "From Tab A"
  4. ✓ Message appears in Tab A chat immediately
  5. ✓ Message appears in Tab B chat within 1-2 seconds (via Realtime broadcast)

### Error Handling

- [ ] **Test 7: Network Error Recovery**
  1. Send a message
  2. Disable network (DevTools → Network tab → Offline)
  3. Try to send another message
  4. ✓ Error message shows: "Network error or session expired"

- [ ] **Test 8: Session Expiry**
  1. Send a message (establishes session)
  2. Wait 1 hour (or manually clear auth session)
  3. Try to send a message
  4. ✓ Should auto-retry anonymous sign-in
  5. ✓ Message should eventually send

### UI/UX Validation

- [ ] **Test 9: Auto-Scroll**
  1. Send 10+ messages
  2. ✓ Chat automatically scrolls to latest message

- [ ] **Test 10: Modal Close**
  1. Open modal
  2. Send a message
  3. Click close button (X)
  4. ✓ Modal closes
  5. ✓ Message persists in DB
  6. Re-open modal
  7. ✓ Previous message appears in history

- [ ] **Test 11: Mobile Responsiveness**
  1. Open DevTools → Toggle Device Toolbar
  2. Test on iPhone 12 (390px width)
  3. ✓ Button is still accessible
  4. ✓ Modal fits on screen
  5. ✓ Input/send button are touch-friendly

## ✅ Admin Testing (Requires Admin User)

### Admin Message Sending

**Prerequisites**: Add your user ID to `admin_users` table
```sql
INSERT INTO admin_users (user_id) VALUES ('your-uuid-here');
```

- [ ] **Test 12: Admin Sign-In**
  1. Sign in to app with admin account
  2. Open chat widget
  3. ✓ Chat should work (same as user chat)
  4. Check console for user session

- [ ] **Test 13: Send Admin Reply**
  1. Get a visitor's `conversation_id` from DB
  2. In Supabase SQL Editor, insert admin message:
     ```sql
     INSERT INTO chat_messages (
       conversation_id, user_id, user_role, content, page_url, message_type
     ) VALUES (
       'visitor-conversation-id',
       'your-admin-uuid',
       'admin',
       'This is an admin reply',
       '/support/contact',
       'text'
     );
     ```
  3. ✓ In visitor browser, message appears within 1-2 seconds (Realtime broadcast)

- [ ] **Test 14: Admin Receives Visitor Messages**
  1. As visitor: Send message "Admin, help me!"
  2. Switch to admin browser tab with chat open
  3. ✓ Message appears within 1-2 seconds

## ✅ Database Query Tests

### Conversation Queries

```sql
-- View all conversations
SELECT id, visitor_user_id, page_url, created_at FROM chat_conversations ORDER BY created_at DESC;

-- View conversation details
SELECT * FROM chat_conversations WHERE id = 'conversation-id';

-- View message count per conversation
SELECT conversation_id, COUNT(*) as message_count FROM chat_messages GROUP BY conversation_id;
```

### Message Queries

```sql
-- View all messages for a conversation
SELECT * FROM chat_messages WHERE conversation_id = 'uuid' ORDER BY created_at;

-- View user vs admin messages
SELECT user_role, COUNT(*) FROM chat_messages WHERE conversation_id = 'uuid' GROUP BY user_role;

-- Check deduplication (should be unique)
SELECT client_message_id, COUNT(*) as count FROM chat_messages GROUP BY client_message_id HAVING COUNT(*) > 1;
```

### RLS Policy Verification

```sql
-- Check if RLS policies are working
-- As anonymous user (should see own messages only)
SELECT * FROM chat_messages;  -- Should error without auth

-- As authenticated user (should see only own conversation)
SELECT * FROM chat_messages WHERE conversation_id = 'their-conversation';
```

## ✅ Performance Checklist

- [ ] **Page Load Time**
  - DevTools → Performance → Record page load
  - ✓ Widget renders in < 100ms
  - ✓ No layout shift (CLS = 0)

- [ ] **Message Send Latency**
  - Send 5 messages in sequence
  - ✓ Each send completes in < 500ms
  - ✓ Realtime delivery < 1 second

- [ ] **Memory Leak Check**
  - Open DevTools → Memory tab
  - Take heap snapshot before chat use
  - Send 50+ messages
  - Take heap snapshot after
  - ✓ No significant memory growth

## ✅ Security Checklist

- [ ] **RLS Prevents Unauthorized Access**
  1. As Visitor A: Can only see own conversation and messages ✓
  2. As Visitor B: Cannot see Visitor A's messages ✓
  3. Admins can see all (enforced by `user_role = 'admin'` and `admin_users` table check) ✓

- [ ] **No Service Role Key Used**
  - Check component code: No `SUPABASE_SERVICE_ROLE_KEY` imported ✓
  - All operations use anon key via RLS ✓

- [ ] **Client Message Deduplication**
  - Send same message twice rapidly
  - ✓ Only one appears in DB (UUID prevents duplicates)

- [ ] **No Sensitive Data in Console**
  - DevTools → Console
  - ✓ No tokens, API keys, or user passwords logged

## ✅ Cleanup & Production Readiness

- [ ] **Remove Test Data**
  ```sql
  DELETE FROM chat_messages WHERE conversation_id IN (SELECT id FROM chat_conversations WHERE created_at > NOW() - INTERVAL '1 day');
  DELETE FROM chat_conversations WHERE created_at > NOW() - INTERVAL '1 day';
  ```

- [ ] **Verify Settings**
  - [ ] Realtime enabled on `chat_messages` table ✓
  - [ ] RLS enabled on all 3 tables ✓
  - [ ] Backup of Supabase created ✓

- [ ] **Documentation**
  - [ ] README.md reviewed ✓
  - [ ] Integration example matches actual code ✓
  - [ ] SQL setup scripts verified ✓

## 📊 Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| 1. Session Sign-In | ⏳ | |
| 2. Conversation Created | ⏳ | |
| 3. Send Message | ⏳ | |
| 4. Message Persisted | ⏳ | |
| 5. Multiple Messages | ⏳ | |
| 6. Realtime Broadcast | ⏳ | |
| 7. Network Error | ⏳ | |
| 8. Session Expiry | ⏳ | |
| 9. Auto-Scroll | ⏳ | |
| 10. Modal Close | ⏳ | |
| 11. Mobile Responsive | ⏳ | |
| 12. Admin Sign-In | ⏳ | |
| 13. Admin Reply | ⏳ | |
| 14. Admin Receives Messages | ⏳ | |

## 🔍 Troubleshooting

### Widget doesn't appear
- Check browser console for errors
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- Run `npm run dev` and check if compilation succeeds

### Messages not sending
- Check Supabase connection: DevTools → Console → `Supabase client config`
- Verify RLS policies: Run VERIFY_SETUP.sql
- Check auth: `supabase.auth.getUser()` in console should return user

### Realtime not working
- Verify Realtime is enabled on `chat_messages` table
- Check Supabase project → Replication → chat_messages (should be enabled)
- Check browser console for WebSocket connection errors

### Admin features not working
- Verify user UUID is in `admin_users` table
- Check JWT role claim is NOT being used (RLS should check table instead)
- Run: `SELECT * FROM admin_users WHERE user_id = 'your-uuid'`

## 📝 Notes

- Widget opens automatically when user touches/clicks chat button
- Anonymous auth is automatic (no login required for visitors)
- All state is client-side except persistence to Supabase
- Deferred features: Typing indicators, read receipts, unread badges
- Deferred: File uploads, rich text formatting

