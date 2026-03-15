-- Compatibility migration: standardize profiles balance column to account_balance

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
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS kyc_status public.kyc_status NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS kyc_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS kyc_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS kyc_rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS kyc_documents_selected TEXT[];

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
