-- Test script: creates a test request+document and verifies the updated_at trigger on kyc_documents
-- Run this in Supabase SQL editor (staging recommended)

WITH one_user AS (
  SELECT id FROM auth.users LIMIT 1
),
upsert_profile AS (
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  SELECT id, 'test+kyc@example.com', NOW(), NOW() FROM one_user
  ON CONFLICT (id) DO UPDATE SET updated_at = EXCLUDED.updated_at
  RETURNING id
),
created AS (
  INSERT INTO public.kyc_requests (user_id, status, metadata)
  SELECT id, 'submitted', '{}'::jsonb FROM upsert_profile
  RETURNING id, user_id
),
doc AS (
  INSERT INTO public.kyc_documents (request_id, user_id, doc_type, storage_path, file_name, mime_type, size, meta)
  SELECT id, user_id, 'test_id', 'test/path', 'test.pdf', 'application/pdf', 123, '{}'::jsonb FROM created
  RETURNING id
),
updated AS (
  UPDATE public.kyc_documents d
  SET meta = COALESCE(meta, '{}'::jsonb) || jsonb_build_object('_trigger_test', now())
  FROM doc
  WHERE d.id = doc.id
  RETURNING d.id, d.uploaded_at, d.updated_at, d.meta
)
SELECT * FROM updated;
