-- ============================================================================
-- Live Chat Widget - Supabase SQL Setup
-- ============================================================================
-- This script sets up the complete Live Chat backend
-- Tables, RLS Policies, Realtime Triggers, and Helper Functions
-- ============================================================================

-- ============================================================================
-- 1. CREATE TABLES
-- ============================================================================

-- Chat Conversations Table
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_url TEXT,
  referrer_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for common queries
  CONSTRAINT chat_conversations_visitor_user_id_idx UNIQUE (visitor_user_id, created_at)
);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_visitor_user_id 
  ON public.chat_conversations(visitor_user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created_at 
  ON public.chat_conversations(created_at DESC);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_role TEXT NOT NULL CHECK (user_role IN ('user', 'admin')),
  content TEXT NOT NULL CHECK (LENGTH(content) <= 10000),
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type = 'text'),
  page_url TEXT,
  client_message_id UUID UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent exact duplicates
  CONSTRAINT unique_client_message_id UNIQUE (client_message_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id 
  ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id 
  ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at 
  ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_client_message_id 
  ON public.chat_messages(client_message_id);

-- Admin Users Table (for authorization)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id 
  ON public.admin_users(user_id);

-- ============================================================================
-- 2. ENABLE ROW-LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. DROP EXISTING RLS POLICIES (if any)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can view conversation messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Admins can send messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Admin read all messages" ON public.chat_messages;

-- ============================================================================
-- 4. CREATE RLS POLICIES FOR chat_conversations
-- ============================================================================

-- Policy: Users can SELECT their own conversations
CREATE POLICY "Users can view own conversations"
  ON public.chat_conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = visitor_user_id);

-- Policy: Authenticated users can INSERT new conversations
CREATE POLICY "Users can create conversations"
  ON public.chat_conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = visitor_user_id);

-- Policy: Users can UPDATE their own conversations (for future use)
CREATE POLICY "Users can update own conversations"
  ON public.chat_conversations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = visitor_user_id)
  WITH CHECK (auth.uid() = visitor_user_id);

-- ============================================================================
-- 5. CREATE RLS POLICIES FOR chat_messages
-- ============================================================================

-- Policy: Users can SELECT messages from their own conversations
CREATE POLICY "Users can view conversation messages"
  ON public.chat_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_conversations
      WHERE chat_conversations.id = chat_messages.conversation_id
        AND chat_conversations.visitor_user_id = auth.uid()
    )
  );

-- Policy: Visitors (users) can INSERT their own messages
CREATE POLICY "Users can send messages"
  ON public.chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Must be in own conversation
    EXISTS (
      SELECT 1 FROM public.chat_conversations
      WHERE chat_conversations.id = chat_messages.conversation_id
        AND chat_conversations.visitor_user_id = auth.uid()
    )
    -- Must be inserting as self
    AND chat_messages.user_id = auth.uid()
    -- Must be set to 'user' role (visitors cannot claim admin)
    AND chat_messages.user_role = 'user'
  );

-- Policy: Admins can INSERT messages to conversations
CREATE POLICY "Admins can send messages"
  ON public.chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Must be an admin (in admin_users table)
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
    -- Admin inserts with their own user_id
    AND chat_messages.user_id = auth.uid()
    -- Admin inserts with 'admin' role
    AND chat_messages.user_role = 'admin'
  );

-- Policy: Admins can view all messages in system
CREATE POLICY "Admins can read all messages"
  ON public.chat_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 6. CREATE RLS POLICIES FOR admin_users
-- ============================================================================

-- Policy: Admins can view other admins (useful for admin panel)
CREATE POLICY "Admins can view admin users"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users as au
      WHERE au.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 7. ENABLE REALTIME FOR chat_messages
-- ============================================================================

-- Run this in Supabase Dashboard: Tables → chat_messages → Realtime → Enable
-- Or via SQL (if available in your Supabase version):
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- ============================================================================
-- 8. CREATE DATABASE TRIGGER FOR REALTIME BROADCAST
-- ============================================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS broadcast_chat_insert_to_conversation 
  ON public.chat_messages;

-- Create function to broadcast changes
CREATE OR REPLACE FUNCTION public.broadcast_chat_insert_to_conversation()
  RETURNS TRIGGER AS $$
  BEGIN
    PERFORM pg_notify(
      'realizeme:' || 'chat:' || NEW.conversation_id || ':INSERT',
      json_build_object(
        'type', 'broadcast',
        'event', 'INSERT',
        'schema', 'public',
        'table', 'chat_messages',
        'commit_timestamp', (EXTRACT(EPOCH FROM NOW()) * 1000)::bigint,
        'new', row_to_json(NEW),
        'old', NULL
      )::text
    );
    RETURN NEW;
  END;
$$ LANGUAGE plpgsql;

-- Create trigger on INSERT
CREATE TRIGGER broadcast_chat_insert_to_conversation
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.broadcast_chat_insert_to_conversation();

-- ============================================================================
-- 9. CREATE UTILITY FUNCTIONS
-- ============================================================================

-- Function: Check if user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
  RETURNS BOOLEAN AS $$
  BEGIN
    RETURN EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = is_admin.user_id
    );
  END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get or create conversation for user
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(
  p_visitor_user_id UUID,
  p_page_url TEXT DEFAULT NULL,
  p_referrer_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  -- Try to get existing conversation
  SELECT id INTO v_conversation_id
  FROM public.chat_conversations
  WHERE visitor_user_id = p_visitor_user_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If no conversation exists, create new one
  IF v_conversation_id IS NULL THEN
    INSERT INTO public.chat_conversations (visitor_user_id, page_url, referrer_url)
    VALUES (p_visitor_user_id, p_page_url, p_referrer_url)
    RETURNING id INTO v_conversation_id;
  END IF;
  
  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 10. GRANTS AND PERMISSIONS
-- ============================================================================

-- Grant table access to authenticated role
GRANT SELECT, INSERT, UPDATE ON public.chat_conversations TO authenticated;
GRANT SELECT, INSERT ON public.chat_messages TO authenticated;
GRANT SELECT ON public.admin_users TO authenticated;
GRANT SELECT ON public.chat_conversations TO authenticated;

-- Grant function access
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_conversation(UUID, TEXT, TEXT) TO authenticated;

-- ============================================================================
-- 11. OPTIONAL: INSERT TEST DATA
-- ============================================================================

-- Uncomment to insert test admin user (replace with real user_id)
-- INSERT INTO public.admin_users (user_id)
-- VALUES ('550e8400-e29b-41d4-a716-446655440000')
-- ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- Next steps:
-- 1. Update .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
-- 2. Add LiveChatWidget to your app/layout.tsx
-- 3. Add admin user_ids to public.admin_users table as needed
-- 4. Test the widget by opening http://localhost:3000
-- ============================================================================
