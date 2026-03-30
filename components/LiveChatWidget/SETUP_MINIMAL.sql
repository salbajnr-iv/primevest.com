-- ============================================================================
-- Live Chat Widget - MINIMAL SQL SETUP (Quick Reference)
-- ============================================================================
-- Bare minimum tables and RLS policies for live chat
-- ============================================================================

-- Tables
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_user_id UUID NOT NULL REFERENCES auth.users(id),
  page_url TEXT,
  referrer_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_role TEXT CHECK (user_role IN ('user', 'admin')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  client_message_id UUID UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Conversations
CREATE POLICY "Users can view own" ON chat_conversations FOR SELECT USING (auth.uid() = visitor_user_id);
CREATE POLICY "Users can create" ON chat_conversations FOR INSERT WITH CHECK (auth.uid() = visitor_user_id);

-- RLS Policies - Messages
CREATE POLICY "Users can read own messages" ON chat_messages FOR SELECT USING (
  EXISTS(SELECT 1 FROM chat_conversations WHERE id = chat_messages.conversation_id AND visitor_user_id = auth.uid())
  OR EXISTS(SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "Users can send" ON chat_messages FOR INSERT WITH CHECK (
  user_id = auth.uid() AND user_role = 'user' AND
  EXISTS(SELECT 1 FROM chat_conversations WHERE id = chat_messages.conversation_id AND visitor_user_id = auth.uid())
);

CREATE POLICY "Admins can send" ON chat_messages FOR INSERT WITH CHECK (
  user_id = auth.uid() AND user_role = 'admin' AND
  EXISTS(SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Trigger
CREATE OR REPLACE FUNCTION broadcast_chat_changes() RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('realtime:chat:' || NEW.conversation_id, json_build_object('type', 'INSERT', 'new', row_to_json(NEW))::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS broadcast_chat_insert ON chat_messages;
CREATE TRIGGER broadcast_chat_insert AFTER INSERT ON chat_messages FOR EACH ROW EXECUTE FUNCTION broadcast_chat_changes();
