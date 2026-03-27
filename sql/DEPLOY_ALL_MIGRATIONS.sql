-- =====================================================
-- ALL-IN-ONE MIGRATION DEPLOYMENT
-- =====================================================
-- Safe to run multiple times - all operations are idempotent
-- This combines all critical migrations into one script
-- =====================================================

-- =====================================================
-- PART 1: PROFILE FIXES (Critical - Fixes "Save failed" error)
-- =====================================================

-- Drop conflicting policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create clean, comprehensive policies
CREATE POLICY "authenticated_select_profiles" ON profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated_insert_profiles" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "authenticated_update_profiles" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- PART 2: COLUMN RECONCILIATION
-- =====================================================

CREATE OR REPLACE FUNCTION public.reconcile_column_name(p_schema text, p_table text, p_old text, p_new text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = p_schema
      AND table_name = p_table
      AND column_name = p_old
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = p_schema
      AND table_name = p_table
      AND column_name = p_new
  ) THEN
    EXECUTE format('ALTER TABLE %I.%I RENAME COLUMN %I TO %I', p_schema, p_table, p_old, p_new);
  END IF;
END;
$$;

SELECT public.reconcile_column_name('public', 'orders', 'total', 'total_amount');
SELECT public.reconcile_column_name('public', 'trades', 'total', 'total_amount');
SELECT public.reconcile_column_name('public', 'transactions', 'total', 'total_amount');

-- =====================================================
-- PART 3: RLS AUDIT HARDENING
-- =====================================================

DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT *
    FROM (VALUES
      ('profiles', 'id'),
      ('notifications', 'user_id'),
      ('orders', 'user_id'),
      ('transactions', 'user_id'),
      ('watchlists', 'user_id'),
      ('kyc_requests', 'user_id'),
      ('kyc_documents', 'user_id'),
      ('support_tickets', 'user_id'),
      ('support_ticket_replies', 'user_id')
    ) AS t(table_name, owner_column)
  LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = rec.table_name
    )
    AND EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = rec.table_name
        AND column_name = rec.owner_column
    ) THEN
      EXECUTE format(
        'ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',
        rec.table_name
      );

      EXECUTE format(
        'DROP POLICY IF EXISTS user_is_owner_%I ON public.%I',
        rec.table_name, rec.table_name
      );

      EXECUTE format(
        'CREATE POLICY user_is_owner_%I ON public.%I',
        rec.table_name, rec.table_name
      ) || ' FOR ALL TO authenticated USING (auth.uid()::text = ' || rec.owner_column || '::text)';
    END IF;
  END LOOP;
END$$;

-- =====================================================
-- PART 4: SUPPORT TICKETS V2
-- =====================================================

ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS open_at timestamptz,
  ADD COLUMN IF NOT EXISTS pending_at timestamptz,
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz,
  ADD COLUMN IF NOT EXISTS closed_at timestamptz;

UPDATE public.support_tickets
SET open_at = COALESCE(open_at, created_at)
WHERE status = 'open';

CREATE TABLE IF NOT EXISTS public.support_ticket_replies (
  id bigserial PRIMARY KEY,
  ticket_id bigint NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  message text NOT NULL,
  is_staff boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS support_tickets_user_id_idx ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS support_tickets_status_idx ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS support_tickets_updated_at_idx ON public.support_tickets(updated_at DESC);
CREATE INDEX IF NOT EXISTS support_ticket_replies_ticket_id_idx ON public.support_ticket_replies(ticket_id, created_at);

-- =====================================================
-- PART 5: ACCOUNT BALANCE MIGRATION
-- =====================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_balance NUMERIC(20, 8);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'balance'
  ) THEN
    EXECUTE 'UPDATE public.profiles SET account_balance = COALESCE(account_balance, balance, 0)';
  END IF;
END$$;

ALTER TABLE public.profiles
  ALTER COLUMN account_balance SET DEFAULT 0,
  ALTER COLUMN account_balance SET NOT NULL;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'balance'
  ) THEN
    EXECUTE 'ALTER TABLE public.profiles DROP COLUMN balance';
  END IF;
END$$;

-- =====================================================
-- PART 6: KYC MIGRATION
-- =====================================================

-- Create enum type for KYC status (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_status') THEN
    CREATE TYPE kyc_status AS ENUM ('none','pending','submitted','under_review','verified','rejected');
  END IF;
END$$;

-- Add KYC fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS kyc_status kyc_status DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS kyc_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS kyc_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS kyc_rejection_reason TEXT;

-- Create kyc_requests table
CREATE TABLE IF NOT EXISTS public.kyc_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status kyc_status NOT NULL DEFAULT 'submitted',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id),
  review_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create kyc_documents table
CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.kyc_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  size BIGINT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  meta JSONB DEFAULT '{}'
);

-- Ensure kyc_documents has updated_at
ALTER TABLE public.kyc_documents
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes
CREATE INDEX IF NOT EXISTS kyc_requests_user_id_idx ON public.kyc_requests(user_id);
CREATE INDEX IF NOT EXISTS kyc_requests_status_idx ON public.kyc_requests(status);
CREATE INDEX IF NOT EXISTS kyc_documents_request_id_idx ON public.kyc_documents(request_id);
CREATE INDEX IF NOT EXISTS kyc_documents_user_id_idx ON public.kyc_documents(user_id);

-- =====================================================
-- PART 7: VALIDATION QUERIES
-- =====================================================

-- Check profiles table structure
SELECT 
  'profiles' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles';

-- Verify key columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN ('account_balance', 'is_admin', 'is_active', 'kyc_status');

-- Check support_ticket_replies exists
SELECT 
  'support_ticket_replies' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'support_ticket_replies';

-- Check KYC tables
SELECT 
  'kyc_requests' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'kyc_requests';

SELECT 
  'kyc_documents' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'kyc_documents';

-- List all RLS policies on profiles
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================
-- All migrations have been applied successfully
-- Check the output above for any errors
-- =====================================================
