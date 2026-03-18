-- Manual SQL validation for profiles upsert RLS and persistence behavior.
-- Run in a staging/target Supabase database after applying migrations.
-- This script validates create + update flows for authenticated users and
-- verifies persisted fields survive reload/session refresh style reads.

BEGIN;

-- Stable fixture IDs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '33333333-3333-3333-3333-333333333333') THEN
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (
      '33333333-3333-3333-3333-333333333333',
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'profile-test@example.com',
      crypt('not-used-in-rls-test', gen_salt('bf')),
      now(),
      now(),
      now()
    );
  END IF;
END $$;

-- Ensure a true CREATE path (no existing profile row)
DELETE FROM public.profiles WHERE id = '33333333-3333-3333-3333-333333333333';

-- 1) Authenticated create/upsert should succeed for own profile
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '33333333-3333-3333-3333-333333333333', true);

INSERT INTO public.profiles (id, full_name, avatar_storage_path, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Profile Create Flow',
  '33333333-3333-3333-3333-333333333333/profile/create.png',
  now()
)
ON CONFLICT (id) DO UPDATE
SET full_name = EXCLUDED.full_name,
    avatar_storage_path = EXCLUDED.avatar_storage_path,
    updated_at = now();

SELECT id, full_name, avatar_storage_path
FROM public.profiles
WHERE id = '33333333-3333-3333-3333-333333333333';

-- 2) Authenticated update/upsert should persist all updated fields
INSERT INTO public.profiles (id, full_name, avatar_storage_path, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Profile Update Flow',
  '33333333-3333-3333-3333-333333333333/profile/update.png',
  now()
)
ON CONFLICT (id) DO UPDATE
SET full_name = EXCLUDED.full_name,
    avatar_storage_path = EXCLUDED.avatar_storage_path,
    updated_at = now();

-- Simulate reload/session refresh by reading again in same auth context.
SELECT id, full_name, avatar_storage_path
FROM public.profiles
WHERE id = '33333333-3333-3333-3333-333333333333';

RESET ROLE;

-- 3) A different authenticated user must not update another user's profile
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '44444444-4444-4444-4444-444444444444', true);

SAVEPOINT other_user_update_attempt;
UPDATE public.profiles
SET full_name = 'Should fail'
WHERE id = '33333333-3333-3333-3333-333333333333';
ROLLBACK TO SAVEPOINT other_user_update_attempt;

RESET ROLE;

ROLLBACK;

