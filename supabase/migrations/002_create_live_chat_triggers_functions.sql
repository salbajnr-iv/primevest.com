-- Migration: Add Realtime Trigger and Utility Functions
-- Format: {timestamp}_create_live_chat_trigger_functions.sql

BEGIN;

-- ============================================================================
-- Create Realtime Trigger Function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.broadcast_chat_insert_to_conversation()
  RETURNS TRIGGER AS $$
  BEGIN
    PERFORM pg_notify(
      'realizeme:' || 'chat:' || NEW.conversation_id::text || ':INSERT',
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

-- ============================================================================
-- Create Realtime Broadcast Trigger
-- ============================================================================

DROP TRIGGER IF EXISTS broadcast_chat_insert_to_conversation ON public.chat_messages;

CREATE TRIGGER broadcast_chat_insert_to_conversation
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.broadcast_chat_insert_to_conversation();

-- ============================================================================
-- Create Utility Functions
-- ============================================================================

-- Function: Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID)
  RETURNS BOOLEAN AS $$
  BEGIN
    RETURN EXISTS(
      SELECT 1 FROM public.admin_users
      WHERE user_id = p_user_id
    );
  END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get conversation count for user
CREATE OR REPLACE FUNCTION public.get_user_conversation_count(p_user_id UUID)
  RETURNS BIGINT AS $$
  BEGIN
    RETURN COUNT(*)
    FROM public.chat_conversations
    WHERE visitor_user_id = p_user_id;
  END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get recent conversations for user (limit 10)
CREATE OR REPLACE FUNCTION public.get_user_recent_conversations(
  p_user_id UUID,
  p_limit INT DEFAULT 10
)
  RETURNS TABLE (
    id UUID,
    page_url TEXT,
    message_count BIGINT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
  ) AS $$
  BEGIN
    RETURN QUERY
    SELECT
      c.id,
      c.page_url,
      COUNT(m.id)::BIGINT,
      MAX(m.created_at),
      c.created_at
    FROM public.chat_conversations c
    LEFT JOIN public.chat_messages m ON m.conversation_id = c.id
    WHERE c.visitor_user_id = p_user_id
    GROUP BY c.id, c.page_url, c.created_at
    ORDER BY MAX(m.created_at) DESC NULLS LAST
    LIMIT p_limit;
  END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get or create conversation
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(
  p_visitor_user_id UUID,
  p_page_url TEXT DEFAULT NULL,
  p_referrer_url TEXT DEFAULT NULL
)
  RETURNS UUID AS $$
  DECLARE
    v_conversation_id UUID;
  BEGIN
    -- Try to get existing (most recent) conversation
    SELECT id INTO v_conversation_id
    FROM public.chat_conversations
    WHERE visitor_user_id = p_visitor_user_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- If no conversation exists, create new one
    IF v_conversation_id IS NULL THEN
      INSERT INTO public.chat_conversations (
        visitor_user_id,
        page_url,
        referrer_url
      )
      VALUES (
        p_visitor_user_id,
        p_page_url,
        p_referrer_url
      )
      RETURNING id INTO v_conversation_id;
    END IF;
    
    RETURN v_conversation_id;
  END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Grant Function Permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_conversation_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_recent_conversations(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_conversation(UUID, TEXT, TEXT) TO authenticated;

COMMIT;
