-- =============================================================================
-- Fix Profile Upsert Error - Migration Script
-- Run this in Supabase SQL Editor to fix the "Save failed {}" error
-- =============================================================================

-- IMPORTANT: Backup existing policies first
-- Run: SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Step 1: Check current RLS status and policies
SELECT 
    'profiles' as table_name,
    relrowsecurity as rls_enabled,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles') as policy_count
FROM pg_class 
WHERE relname = 'profiles';

-- Step 2: List all existing policies on profiles table
SELECT 
    policyname,
    cmd,
    CASE WHEN qual IS NOT NULL THEN substring(qual::text, 1, 150) ELSE 'no condition' END as condition,
    CASE WHEN with_check IS NOT NULL THEN substring(with_check::text, 1, 150) ELSE 'no check' END as with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Step 3: Drop potentially conflicting policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can upsert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

-- Step 4: Create proper combined policy for upsert operations
-- This single policy handles all operations (SELECT, INSERT, UPDATE, DELETE) for own profile
CREATE POLICY "Users manage own profile" ON profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Step 5: Verify the policy was created
SELECT 
    policyname,
    tablename,
    cmd,
    CASE WHEN qual IS NOT NULL THEN substring(qual::text, 1, 200) ELSE 'no condition' END as condition,
    CASE WHEN with_check IS NOT NULL THEN substring(with_check::text, 1, 200) ELSE 'no check' END as with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Step 6: Grant admins full access (if not already done)
-- Note: Admin policies are typically already created by other migration scripts
-- This is just a safety check
CREATE POLICY IF NOT EXISTS "Admins can view all profiles" ON profiles
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY IF NOT EXISTS "Admins can update any profile" ON profiles
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Step 7: Verify table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Step 8: Test the fix by checking if upsert would work for current user
-- This query returns your current user ID and profile info
SELECT 
    auth.uid() as current_user_id,
    (SELECT COUNT(*) FROM profiles WHERE id = auth.uid()) as profile_exists;

-- Step 9: Check for any constraint violations
SELECT 
    constraint_name,
    table_name,
    column_name
FROM information_schema.table_constraints 
WHERE table_name = 'profiles'
AND constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE');

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Query 1: Check all RLS policies
SELECT 
    policyname,
    tablename,
    cmd,
    CASE WHEN qual IS NOT NULL THEN substring(qual::text, 1, 100) ELSE 'no condition' END as using_condition,
    CASE WHEN with_check IS NOT NULL THEN substring(with_check::text, 1, 100) ELSE 'no check' END as with_check_condition
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- Query 2: Test if current user can read their own profile
-- This should return your profile if RLS is working correctly
DO $$
DECLARE
    v_user_id UUID;
    v_profile_count INTEGER;
BEGIN
    v_user_id := auth.uid();
    EXECUTE format('SELECT COUNT(*) FROM profiles WHERE id = %L', v_user_id) INTO v_profile_count;
    RAISE NOTICE 'Current user: %', v_user_id;
    RAISE NOTICE 'Profile count for current user: %', v_profile_count;
END;
$$;

-- =============================================================================
-- ROLLBACK SCRIPT (if needed)
-- =============================================================================
-- Run this if you need to rollback the changes:
/*
-- Drop the combined policy
DROP POLICY IF EXISTS "Users manage own profile" ON profiles;

-- Recreate individual policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
*/

-- =============================================================================
-- EXPECTED OUTPUT AFTER RUNNING THIS SCRIPT
-- =============================================================================
-- You should see:
-- 1. A new policy called "Users manage own profile" with cmd = 'ALL'
-- 2. The policy should have USING condition: (auth.uid() = id)
-- 3. The WITH CHECK condition should also be: (auth.uid() = id)
-- 4. Total policy count should be at least 3-4 policies on profiles table

