# LiveChat Widget - Supabase Connection Test

## Quick Test (Browser Console)

Copy and paste the following into your browser console (F12 → Console tab):

```javascript
// Test Supabase connection
async function testLiveChat() {
  try {
    console.log('🧪 Testing LiveChat Supabase Connection...')
    
    // Note: This assumes supabase client is available globally
    // If not available, you'll see an error about ReferenceError
    
    const response = await fetch('/api/chat/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'test' })
    })
    
    const result = await response.json()
    console.log('✅ Test Result:', result)
    
    if (result.error) {
      console.error('❌ Error:', result.error)
      console.error('Details:', result.details)
    }
  } catch (err) {
    console.error('❌ Test Failed:', err)
  }
}

testLiveChat()
```

## Manual Test

1. **Open DevTools**: Press F12
2. **Go to Console Tab**
3. **Click the chat widget button**
4. **Watch the logs** with `[LiveChat]` prefix

You should see:

- ✅ `[LiveChat] Testing Supabase connection...`
- ✅ `[LiveChat] Opening chat widget...`
- ✅ `[LiveChat] Visitor ID: [some-uuid]`
- ✅ `[LiveChat] Checking for existing conversation...`

## What to Expect

### Success ✅

```
[LiveChat] Connection test passed. Data: [...]
[LiveChat] Created new conversation: [uuid]
[LiveChat] Chat widget open and ready
```

→ Chat interface opens with "No messages yet" message

### Partial Success

```
[LiveChat] Insert succeeded but no data returned
```

→ Chat opens but shows an error about the conversation
→ Check the SQL schema is returning `id` in the SELECT

### RLS Error ❌

```
Supabase insert error details:
  code: "42501"
  message: "new row violates row-level security policy"
  hint: "Rows with policies can't be inserted into policy protected tables"
```

→ RLS policies are blocking the insert (see Fix RLS Policies section)

### Connection Error ❌

```
[LiveChat] Connection test failed: {...}
```

→ Supabase client not initialized or credentials are wrong
→ Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Checklist Before Debugging

- [ ] Browser is open to the Primevest app (<http://localhost:3000> or actual domain)
- [ ] DevTools Console is visible (F12)
- [ ] No network errors in Network tab
- [ ] Supabase database is running and accessible
- [ ] Environment variables are set in `.env.local`

## Environment Variables Required

Your `.env.local` should have:

```
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

If missing, the Supabase client won't initialize.

## Still Not Working?

If the chat still doesn't open after these checks:

1. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear browser cache**: DevTools → Application → Clear Storage
3. **Check server logs**: See if there are any errors in your Next.js server output
4. **Check Supabase logs**: Go to Supabase Dashboard → Logs
5. **Share console output**: Run the test and share the full console output

## RLS Policies - The Most Common Issue

The most likely problem is RLS policies. Check your Supabase database:

1. Go to <https://app.supabase.com>
2. Select your project
3. Go to **SQL Editor**
4. Run this:

```sql
-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('chat_conversations', 'chat_messages')
AND schemaname = 'public';

-- Check existing policies
SELECT * FROM pg_policies 
WHERE tablename IN ('chat_conversations', 'chat_messages');
```

**If RLS is on (rowsecurity = true)** but you don't see policies for anon/public role, that's the problem.

**Solution:** Run this to fix it:

```sql
-- Enable RLS if not already enabled
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous users
CREATE POLICY "Allow anon to create conversations"
ON chat_conversations FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "Allow anon to read conversations"
ON chat_conversations FOR SELECT TO anon
USING (true);

CREATE POLICY "Allow anon to insert messages"
ON chat_messages FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "Allow anon to read messages"
ON chat_messages FOR SELECT TO anon
USING (true);
```

Then **refresh the app** and try the widget again.
