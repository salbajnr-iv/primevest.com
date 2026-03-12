-- Supabase migration: KYC tables, columns, RLS policies, and audit trigger

-- 1) Create enum type for KYC status (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_status') THEN
    CREATE TYPE kyc_status AS ENUM ('none','pending','submitted','under_review','verified','rejected');
  END IF;
END$$;

-- 2) Add KYC fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS kyc_status kyc_status DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS kyc_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS kyc_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS kyc_rejection_reason TEXT;

-- 3) Create kyc_requests table
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

-- 4) Create kyc_documents table
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

-- Ensure kyc_documents has an updated_at column (idempotent)
ALTER TABLE public.kyc_documents
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 5) Indexes
CREATE INDEX IF NOT EXISTS idx_kyc_requests_user_id ON public.kyc_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_requests_status ON public.kyc_requests(status);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_id ON public.kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_request_id ON public.kyc_documents(request_id);

-- 6) Enable RLS for kyc tables
ALTER TABLE public.kyc_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

-- 7) Policies for kyc_requests
-- Allow users to insert their own requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Allow insert by owner' AND polrelid = 'public.kyc_requests'::regclass
  ) THEN
    CREATE POLICY "Allow insert by owner" ON public.kyc_requests
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

-- Allow users to select their own requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Allow select by owner' AND polrelid = 'public.kyc_requests'::regclass
  ) THEN
    CREATE POLICY "Allow select by owner" ON public.kyc_requests
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END$$;

-- Allow admins to select all
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Admins can select all' AND polrelid = 'public.kyc_requests'::regclass
  ) THEN
    CREATE POLICY "Admins can select all" ON public.kyc_requests
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
      );
  END IF;
END$$;

-- Allow only admins to update requests (status changes, review fields)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Admins can update requests' AND polrelid = 'public.kyc_requests'::regclass
  ) THEN
    CREATE POLICY "Admins can update requests" ON public.kyc_requests
      FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
      ) WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
      );
  END IF;
END$$;

-- 8) Policies for kyc_documents
-- Allow users to insert their own documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Allow insert documents by owner' AND polrelid = 'public.kyc_documents'::regclass
  ) THEN
    CREATE POLICY "Allow insert documents by owner" ON public.kyc_documents
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

-- Allow users to select their own documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Allow select documents by owner' AND polrelid = 'public.kyc_documents'::regclass
  ) THEN
    CREATE POLICY "Allow select documents by owner" ON public.kyc_documents
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END$$;

-- Allow admins to select, update and delete
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Admins can select documents' AND polrelid = 'public.kyc_documents'::regclass
  ) THEN
    CREATE POLICY "Admins can select documents" ON public.kyc_documents
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
      );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Admins can update documents' AND polrelid = 'public.kyc_documents'::regclass
  ) THEN
    CREATE POLICY "Admins can update documents" ON public.kyc_documents
      FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
      ) WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
      );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Admins can delete documents' AND polrelid = 'public.kyc_documents'::regclass
  ) THEN
    CREATE POLICY "Admins can delete documents" ON public.kyc_documents
      FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
      );
  END IF;
END$$;

-- Allow users to delete their own documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Allow delete by owner' AND polrelid = 'public.kyc_documents'::regclass
  ) THEN
    CREATE POLICY "Allow delete by owner" ON public.kyc_documents
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END$$;

-- 9) Trigger: Log admin actions when a request status changes
CREATE OR REPLACE FUNCTION public.log_kyc_request_action()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.admin_actions (admin_id, action_type, target_user_id, target_table, old_value, new_value, created_at)
    VALUES (auth.uid(), 'kyc_request_update', NEW.user_id, 'kyc_requests', row_to_json(OLD), row_to_json(NEW), NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger using trigger function
DROP TRIGGER IF EXISTS trg_log_kyc_request_action ON public.kyc_requests;
CREATE TRIGGER trg_log_kyc_request_action
AFTER UPDATE ON public.kyc_requests
FOR EACH ROW EXECUTE FUNCTION public.log_kyc_request_action();

-- 10) Ensure timestamps auto-update
CREATE OR REPLACE FUNCTION public.set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_set_updated_at_kyc_requests ON public.kyc_requests;
CREATE TRIGGER trg_set_updated_at_kyc_requests
BEFORE UPDATE ON public.kyc_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();

DROP TRIGGER IF EXISTS trg_set_updated_at_kyc_documents ON public.kyc_documents;
CREATE TRIGGER trg_set_updated_at_kyc_documents
BEFORE UPDATE ON public.kyc_documents
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();

-- 11) Verify expected policies exist
DO $$
DECLARE
  missing int;
BEGIN
  SELECT COUNT(*) INTO missing
  FROM (
    VALUES
      ('Allow insert by owner','public.kyc_requests'),
      ('Allow select by owner','public.kyc_requests'),
      ('Admins can select all','public.kyc_requests'),
      ('Admins can update requests','public.kyc_requests'),
      ('Allow insert documents by owner','public.kyc_documents'),
      ('Allow select documents by owner','public.kyc_documents'),
      ('Admins can select documents','public.kyc_documents'),
      ('Admins can update documents','public.kyc_documents'),
      ('Admins can delete documents','public.kyc_documents'),
      ('Allow delete by owner','public.kyc_documents')
  ) AS expected(name, relname)
  LEFT JOIN pg_policies pol ON pol.polname = expected.name AND pol.polrelid = expected.relname::regclass
  WHERE pol.polname IS NULL;

  IF missing = 0 THEN
    RAISE NOTICE 'KYC policy verification passed: all policies present.';
  ELSE
    RAISE EXCEPTION 'KYC policy verification failed: % policy(ies) missing. Review migration and DB state.', missing;
  END IF;
END$$;

-- 12) Notes: Create Supabase Storage bucket 'kyc-documents' (private) via Supabase UI or API. Ensure upload/download ACLs and retention policies are configured.
