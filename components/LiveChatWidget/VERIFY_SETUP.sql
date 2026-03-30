-- ============================================================================
-- Live Chat Widget - VERIFICATION SCRIPT
-- ============================================================================
-- Run this script to verify that all tables, policies, and triggers are set up
-- ============================================================================

-- ============================================================================
-- 1. CHECK TABLES EXIST
-- ============================================================================

SELECT 'TABLES CHECK' as check_name;

SELECT 
  table_name,
  CASE 
    WHEN table_name = 'chat_conversations' THEN '✓ Found'
    WHEN table_name = 'chat_messages' THEN '✓ Found'
    WHEN table_name = 'admin_users' THEN '✓ Found'
    ELSE '✗ Unknown'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name IN ('chat_conversations', 'chat_messages', 'admin_users')
ORDER BY table_name;

-- ============================================================================
-- 2. CHECK TABLE COLUMNS
-- ============================================================================

SELECT 'COLUMNS CHECK' as check_name;

-- chat_conversations columns
SELECT 
  'chat_conversations' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'chat_conversations'
ORDER BY ordinal_position;

-- chat_messages columns
SELECT 
  'chat_messages' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'chat_messages'
ORDER BY ordinal_position;

-- ============================================================================
-- 3. CHECK RLS ENABLED
-- ============================================================================

SELECT 'RLS STATUS' as check_name;

SELECT
  schemaname,
  tablename,
  rowsecurity,
  CASE WHEN rowsecurity THEN '✓ Enabled' ELSE '✗ Disabled' END as status
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('chat_conversations', 'chat_messages', 'admin_users')
ORDER BY tablename;

-- ============================================================================
-- 4. CHECK RLS POLICIES
-- ============================================================================

SELECT 'RLS POLICIES' as check_name;

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  qual AS select_clause,
  with_check AS insert_clause
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- 5. CHECK INDEXES
-- ============================================================================

SELECT 'INDEXES' as check_name;

SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('chat_conversations', 'chat_messages', 'admin_users')
ORDER BY tablename, indexname;

-- ============================================================================
-- 6. CHECK TRIGGERS
-- ============================================================================

SELECT 'TRIGGERS' as check_name;

SELECT
  trigger_schema,
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table = 'chat_messages'
ORDER BY trigger_name;

-- ============================================================================
-- 7. CHECK FUNCTIONS
-- ============================================================================

SELECT 'FUNCTIONS' as check_name;

SELECT
  routine_schema,
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'is_admin',
    'get_or_create_conversation',
    'get_user_conversation_count',
    'get_user_recent_conversations',
    'broadcast_chat_insert_to_conversation'
  );

-- ============================================================================
-- 8. CHECK REALTIME PUBLICATION
-- ============================================================================

SELECT 'REALTIME PUBLICATION' as check_name;

SELECT
  schemaname,
  tablename,
  CASE WHEN tablename IN (SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime') 
    THEN '✓ Enabled'
    ELSE '✗ Disabled'
  END as realtime_status
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'chat_messages';

-- ============================================================================
-- 9. TEST DATA (Optional - create test conversation if needed)
-- ============================================================================

-- Uncomment to create test data:
-- INSERT INTO public.chat_conversations (visitor_user_id, page_url)
-- VALUES (auth.uid(), 'https://example.com/test')
-- ON CONFLICT DO NOTHING;

-- INSERT INTO public.chat_messages (
--   conversation_id,
--   user_id,
--   user_role,
--   content,
--   client_message_id
-- ) VALUES (
--   (SELECT id FROM chat_conversations WHERE visitor_user_id = auth.uid() LIMIT 1),
--   auth.uid(),
--   'user',
--   'Test message from verification script',
--   gen_random_uuid()
-- );

-- ============================================================================
-- 10. SUMMARY REPORT
-- ============================================================================

SELECT 'VERIFICATION SUMMARY' as check_name;

SELECT 
  CASE
    WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('chat_conversations', 'chat_messages', 'admin_users')) = 3
    THEN '✓ All tables exist'
    ELSE '✗ Missing tables'
  END as tables_status,
  
  CASE
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') >= 5
    THEN '✓ RLS policies configured'
    ELSE '✗ RLS policies missing'
  END as rls_status,
  
  CASE
    WHEN (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public' AND trigger_name = 'broadcast_chat_insert_to_conversation') = 1
    THEN '✓ Realtime trigger exists'
    ELSE '✗ Realtime trigger missing'
  END as trigger_status,
  
  CASE
    WHEN (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('broadcast_chat_insert_to_conversation', 'is_admin')) >= 2
    THEN '✓ Functions created'
    ELSE '✗ Functions missing'
  END as functions_status;

-- ============================================================================
-- POST-VERIFICATION NEXT STEPS
-- ============================================================================

-- If all checks pass:
-- 1. Add an admin user:
--    INSERT INTO public.admin_users (user_id) VALUES ('user_id_here');
--
-- 2. Test INSERT permission:
--    INSERT INTO public.chat_conversations (visitor_user_id, page_url)
--    VALUES (auth.uid(), 'https://example.com');
--
-- 3. Test SELECT permission:
--    SELECT * FROM public.chat_conversations WHERE visitor_user_id = auth.uid();
--
-- 4. Test frontend: Add LiveChatWidget to app/layout.tsx and test in browser

-- ============================================================================
