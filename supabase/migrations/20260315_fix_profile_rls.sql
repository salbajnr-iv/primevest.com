-- Supabase PostgreSQL Migration: Profile RLS Fix
-- ======================================================================
-- This file contains PostgreSQL-specific syntax. Disable MSSQL parsing:
-- SQL Editor → Settings → Parser → Language Mode → PostgreSQL / Plain SQL
-- ======================================================================

-- 1. Drop conflicting policies safely
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- 2. Users manage own profile (INSERT/UPDATE/SELECT/DELETE)
CREATE POLICY "Users manage own profile" ON public.profiles
FOR ALL USING (auth.uid()::uuid = id)
WITH CHECK (auth.uid()::uuid = id);

-- 3. Admin policy - idempotent (only creates if missing)
DO $policy_fix$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p 
    WHERE p.schemaname = 'public' 
      AND p.tablename = 'profiles' 
      AND p.policyname = 'admins_update_profiles'
  ) THEN
    CREATE POLICY "admins_update_profiles" ON public.profiles
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid()::uuid AND is_admin = true
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid()::uuid AND is_admin = true
      )
    );
  END IF;
END $policy_fix$;

-- Verification queries (run after migration):
/*
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;
*/
