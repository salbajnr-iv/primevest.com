-- =============================================================================
-- STEP 1: Create profiles table (links to auth.users)
-- =============================================================================
-- Create enum for KYC status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_status') THEN
    CREATE TYPE kyc_status AS ENUM ('none','pending','submitted','under_review','verified','rejected');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  email TEXT,
  balance DECIMAL(20, 8) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_admin BOOLEAN DEFAULT false,
  kyc_status kyc_status DEFAULT 'none',
  kyc_requested_at TIMESTAMP WITH TIME ZONE,
  kyc_reviewed_at TIMESTAMP WITH TIME ZONE,
  kyc_rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- STEP 2: Enable Row Level Security (RLS)
-- =============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- STEP 3: Create policies for profiles table
-- =============================================================================

-- Policy: Allow users to view their OWN profile only
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Allow users to insert their OWN profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Allow users to update their OWN profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Policy: Allow admins to update any profile
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Policy: Allow users to delete their OWN profile
CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- =============================================================================
-- STEP 3b: Create admin_users table (for admin-specific data)
-- =============================================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  permissions JSONB DEFAULT '{}',
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow admins to view all admin_users
CREATE POLICY "Admins can view admin_users" ON admin_users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Policy: Allow admins to insert admin_users
CREATE POLICY "Admins can insert admin_users" ON admin_users
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Policy: Allow admins to update admin_users
CREATE POLICY "Admins can update admin_users" ON admin_users
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Policy: Admin users can view their own record
CREATE POLICY "Admin can view own record" ON admin_users
  FOR SELECT USING (auth.uid() = id);

-- =============================================================================
-- STEP 3c: Create balance_history table (audit trail for balance changes)
-- =============================================================================
CREATE TABLE IF NOT EXISTS balance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL CHECK (action_type IN ('add', 'subtract', 'set', 'reset')),
  currency TEXT NOT NULL DEFAULT 'EUR',
  amount DECIMAL(20, 8) NOT NULL,
  previous_balance DECIMAL(20, 8),
  new_balance DECIMAL(20, 8),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for balance_history
ALTER TABLE balance_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own balance history
CREATE POLICY "Users can view own balance history" ON balance_history
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Admins can view all balance history
CREATE POLICY "Admins can view all balance history" ON balance_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Policy: Admins can insert balance history
CREATE POLICY "Admins can insert balance history" ON balance_history
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- =============================================================================
-- STEP 3d: Create admin_actions audit log (track all admin actions)
-- =============================================================================
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  target_user_id UUID REFERENCES profiles(id),
  target_table TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for admin_actions
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all admin actions
CREATE POLICY "Admins can view admin_actions" ON admin_actions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Policy: Admins can insert admin actions
CREATE POLICY "Admins can insert admin_actions" ON admin_actions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- =============================================================================
-- STEP 4: Create a function to automatically create profile on signup
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_email TEXT;
BEGIN
  -- Get email from metadata or from NEW.email
  v_email := COALESCE(NEW.raw_user_meta_data->>'email', NEW.email);
  
  -- Check if email matches admin pattern (admin@* or specific admin emails)
  -- You can customize this pattern as needed
  v_is_admin := v_email ILIKE 'admin@%' 
                OR v_email = 'support@bitpandapro.com'
                OR v_email = 'admin@bitpandapro.com';
  
  -- Insert into profiles with is_admin flag based on email pattern
  INSERT INTO public.profiles (id, full_name, avatar_url, email, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    v_email,
    v_is_admin
  );
  
  -- If admin, also create admin_users record
  IF v_is_admin THEN
    INSERT INTO admin_users (id, email, full_name)
    VALUES (
      NEW.id,
      v_email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    )
    ON CONFLICT (id) DO UPDATE SET 
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;

-- =============================================================================
-- STEP 5: Create trigger to call function on new user signup
-- =============================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- STEP 5b: Create function to set admin role
-- =============================================================================
CREATE OR REPLACE FUNCTION public.set_admin_role(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles SET is_admin = true WHERE id = user_id;
  INSERT INTO admin_users (id, email, full_name)
  SELECT id, email, full_name FROM profiles WHERE id = user_id
  ON CONFLICT (id) DO UPDATE SET updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- STEP 5c: Create function to adjust user balance
-- =============================================================================
CREATE OR REPLACE FUNCTION public.adjust_balance(
  p_user_id UUID,
  p_action_type TEXT,
  p_amount DECIMAL(20, 8),
  p_reason TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_previous_balance DECIMAL(20, 8);
  v_new_balance DECIMAL(20, 8);
  v_admin_id UUID;
BEGIN
  -- Get the admin's ID (current user)
  v_admin_id := auth.uid();
  
  -- Check if the caller is an admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_admin_id AND is_admin = true) THEN
    RAISE EXCEPTION 'Only admins can adjust balances';
  END IF;
  
  -- Get current balance
  SELECT balance INTO v_previous_balance FROM profiles WHERE id = p_user_id;
  
  -- Calculate new balance based on action type
  IF p_action_type = 'add' THEN
    v_new_balance := v_previous_balance + p_amount;
  ELSIF p_action_type = 'subtract' THEN
    v_new_balance := v_previous_balance - p_amount;
    IF v_new_balance < 0 THEN
      RAISE EXCEPTION 'Balance cannot go below zero';
    END IF;
  ELSIF p_action_type = 'set' THEN
    v_new_balance := p_amount;
  ELSIF p_action_type = 'reset' THEN
    v_new_balance := 0;
  ELSE
    RAISE EXCEPTION 'Invalid action type. Use add, subtract, set, or reset';
  END IF;
  
  -- Update the balance
  UPDATE profiles SET balance = v_new_balance, updated_at = NOW() WHERE id = p_user_id;
  
  -- Record the balance change
  INSERT INTO balance_history (user_id, admin_id, action_type, amount, previous_balance, new_balance, reason)
  VALUES (p_user_id, v_admin_id, p_action_type, p_amount, v_previous_balance, v_new_balance, p_reason);
  
  -- Log admin action
  INSERT INTO admin_actions (admin_id, action_type, target_user_id, target_table, new_value)
  VALUES (v_admin_id, 'balance_adjustment', p_user_id, 'profiles', 
          jsonb_build_object('action', p_action_type, 'amount', p_amount, 'reason', p_reason));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- STEP 5d: Create function to toggle user status
-- =============================================================================
CREATE OR REPLACE FUNCTION public.toggle_user_status(user_id UUID, is_active BOOLEAN)
RETURNS VOID AS $$
DECLARE
  v_admin_id UUID;
BEGIN
  v_admin_id := auth.uid();
  
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_admin_id AND is_admin = true) THEN
    RAISE EXCEPTION 'Only admins can toggle user status';
  END IF;
  
  UPDATE profiles SET is_active = is_active, updated_at = NOW() WHERE id = user_id;
  
  INSERT INTO admin_actions (admin_id, action_type, target_user_id, target_table, new_value)
  VALUES (v_admin_id, 'user_status_change', user_id, 'profiles', 
          jsonb_build_object('is_active', is_active));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- STEP 6: Create indexes for better performance
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_balance_history_user_id ON balance_history(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_history_created_at ON balance_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_user_id ON admin_actions(target_user_id);

-- =============================================================================
-- VERIFICATION: Check that everything was created correctly
-- =============================================================================
SELECT 
  'profiles' as table_name,
  (SELECT COUNT(*) FROM information_schema.table_constraints 
   WHERE table_name = 'profiles' AND constraint_type = 'PRIMARY KEY') as has_primary_key,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles') as policy_count;

-- List all policies created
SELECT policyname, tablename, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('profiles', 'admin_users', 'balance_history', 'admin_actions');

-- =============================================================================
-- HOW TO CREATE AN ADMIN USER
-- =============================================================================
-- After running this script, execute the following to create an admin:
-- SELECT public.set_admin_role('YOUR_USER_UUID_HERE');
-- 
-- To find a user's UUID, query: SELECT id, email, full_name FROM profiles;

-- =============================================================================
-- TESTING: How to test after running this script
-- =============================================================================
-- 1. Go to your app: http://localhost:3000/auth/signup
-- 2. Create a new user account
-- 3. Check Supabase Dashboard → Table Editor → profiles
-- 4. You should see the new user's profile automatically created!
-- 5. To make the user an admin, run: SELECT public.set_admin_role('user-uuid');

-- =============================================================================
-- STEP 7: Create orders table for trading orders
-- =============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  asset TEXT NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  price DECIMAL(20, 8),
  total DECIMAL(20, 8) NOT NULL,
  order_type TEXT NOT NULL DEFAULT 'market' CHECK (order_type IN ('market', 'limit')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own orders
CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own pending orders
CREATE POLICY "Users can update own pending orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- =============================================================================
-- STEP 6: Create KYC tables
-- =============================================================================
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
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  meta JSONB DEFAULT '{}'
);

-- Create indexes for KYC tables
CREATE INDEX IF NOT EXISTS idx_kyc_requests_user_id ON public.kyc_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_requests_status ON public.kyc_requests(status);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_id ON public.kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_request_id ON public.kyc_documents(request_id);

-- Enable RLS for KYC tables
ALTER TABLE public.kyc_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

-- Policies for kyc_requests
CREATE POLICY "Allow insert by owner" ON public.kyc_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow select by owner" ON public.kyc_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can select all kyc_requests" ON public.kyc_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update kyc_requests" ON public.kyc_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Policies for kyc_documents
CREATE POLICY "Allow insert documents by owner" ON public.kyc_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow select documents by owner" ON public.kyc_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can select documents" ON public.kyc_documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update documents" ON public.kyc_documents
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can delete documents" ON public.kyc_documents
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Policy: Admins can view all orders
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_asset ON orders(asset);
 

