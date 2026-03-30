-- Migration file for live chat
-- This can be placed in supabase/migrations/ for version control
-- Format: {timestamp}_create_live_chat_tables.sql

-- ============================================================================
-- Create Live Chat Tables
-- ============================================================================

BEGIN;

-- Create chat_conversations table
CREATE TABLE public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  visitor_user_id uuid not null references auth.users(id) on delete cascade,
  page_url text,
  referrer_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.chat_conversations enable row level security;

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_role text not null check (user_role in ('user', 'admin')),
  content text not null check (char_length(content) <= 10000),
  message_type text not null default 'text' check (message_type = 'text'),
  page_url text,
  client_message_id uuid unique,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.chat_messages enable row level security;

-- Create admin_users table
CREATE TABLE public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.admin_users enable row level security;

-- ============================================================================
-- Create Indexes
-- ============================================================================

CREATE INDEX idx_chat_conversations_visitor_user_id 
  ON public.chat_conversations(visitor_user_id);

CREATE INDEX idx_chat_messages_conversation_id 
  ON public.chat_messages(conversation_id);

CREATE INDEX idx_chat_messages_user_id 
  ON public.chat_messages(user_id);

CREATE INDEX idx_chat_messages_created_at 
  ON public.chat_messages(created_at desc);

CREATE INDEX idx_admin_users_user_id 
  ON public.admin_users(user_id);

-- ============================================================================
-- Create RLS Policies
-- ============================================================================

-- Conversations: Users see own
CREATE POLICY "Users can view own conversations"
  ON public.chat_conversations for select
  TO authenticated
  USING (auth.uid() = visitor_user_id);

-- Conversations: Users create own
CREATE POLICY "Users can create conversations"
  ON public.chat_conversations for insert
  TO authenticated
  WITH CHECK (auth.uid() = visitor_user_id);

-- Messages: Users see messages in own conversations
CREATE POLICY "Users can view conversation messages"
  ON public.chat_messages for select
  TO authenticated
  USING (
    EXISTS(
      SELECT 1 FROM public.chat_conversations
      WHERE id = chat_messages.conversation_id
        AND visitor_user_id = auth.uid()
    ) OR EXISTS(
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Messages: Users send to own conversations
CREATE POLICY "Users can send messages"
  ON public.chat_messages for insert
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND user_role = 'user'
    AND EXISTS(
      SELECT 1 FROM public.chat_conversations
      WHERE id = chat_messages.conversation_id
        AND visitor_user_id = auth.uid()
    )
  );

-- Messages: Admins send admin messages
CREATE POLICY "Admins can send messages"
  ON public.chat_messages for insert
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND user_role = 'admin'
    AND EXISTS(
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Admin_users: Admins see other admins
CREATE POLICY "Admins can view admin users"
  ON public.admin_users for select
  TO authenticated
  USING (
    EXISTS(
      SELECT 1 FROM public.admin_users t
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- Grant Permissions
-- ============================================================================

grant select, insert, update on public.chat_conversations to authenticated;
grant select, insert on public.chat_messages to authenticated;
grant select on public.admin_users to authenticated;

COMMIT;
