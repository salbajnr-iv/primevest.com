-- Supabase PostgreSQL Migration: Complete Setup (20260315001845)
-- ======================================================================
-- PostgreSQL/Supabase only. VSCode: Language Mode → PostgreSQL / Plain SQL
-- ======================================================================

-- Enable required extensions first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- STEP 1: KYC Status Enum (idempotent)
DO $enum_create$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_status') THEN
    CREATE TYPE public.kyc_status AS ENUM (
      'none', 'pending', 'submitted', 'under_review', 'verified', 'rejected'
    );
  END IF;
END $enum_create$;

-- STEP 2: Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT UNIQUE,
  account_balance DECIMAL(20, 8) DEFAULT 0 CHECK (account_balance >= 0),
  is_admin BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  kyc_status public.kyc_status DEFAULT 'none',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT 
  USING (auth.uid()::uuid = id);

CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid()::uuid = id);

CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE 
  USING (auth.uid()::uuid = id);

CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT 
  USING (EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid()::uuid AND is_admin));

CREATE POLICY "Admins update profiles" ON public.profiles FOR UPDATE 
  USING (EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid()::uuid AND is_admin));

-- STEP 3: Admin Users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  permissions JSONB DEFAULT '{}',
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admin Users Policies (abbreviated for space)
CREATE POLICY "Admins view admin_users" ON public.admin_users FOR ALL
  USING (EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid()::uuid AND is_admin));

-- STEP 4: Balance History (Audit)
CREATE TABLE IF NOT EXISTS public.balance_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL CHECK (action_type IN ('add','subtract','set','reset')),
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD','EUR')),
  amount DECIMAL(20,8) NOT NULL,
  previous_balance DECIMAL(20,8),
  new_balance DECIMAL(20,8),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.balance_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own history" ON public.balance_history FOR SELECT
  USING (auth.uid()::uuid = user_id);

CREATE POLICY "Admins full history" ON public.balance_history FOR ALL
  USING (EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid()::uuid AND is_admin));

-- STEP 5: Admin Actions Log
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  target_user_id UUID REFERENCES public.profiles(id),
  target_table TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins log access" ON public.admin_actions FOR ALL
  USING (EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid()::uuid AND is_admin));

-- STEP 6: Auto-create profile trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $user_trigger$
DECLARE
  new_email TEXT := COALESCE(NEW.raw_user_meta_data->>'email', NEW.email);
  is_admin_user BOOLEAN;
BEGIN
  -- Check admin email patterns
  is_admin_user := new_email ~* '^admin@' OR new_email IN (
    'support@bitpandapro.com', 'admin@bitpandapro.com'
  );

  INSERT INTO public.profiles (id, email, full_name, is_admin)
  VALUES (NEW.id, new_email, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(new_email, '@', 1)), is_admin_user);

  RETURN NEW;
END $user_trigger$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

/* Migration complete. Verify:
   SELECT * FROM public.profiles LIMIT 1;
   SELECT count(*) FROM pg_policies WHERE tablename IN ('profiles','balance_history');
*/
