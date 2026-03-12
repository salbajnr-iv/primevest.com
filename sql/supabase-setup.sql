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
02bdcb7 (Initial commit)
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
  INSERT INTO public.profiles (id, full_name, avatar_url, email, is_admin)02bdcb7 (Initial commit)815276c (`Updated various files across the application to enhance UI/UX, add new features, and improve functionality.`)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
<<<<<<< HEAD
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
END;815276c (`Updated various files across the application to enhance UI/UX, add new features, and improve functionality.`)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
>>>>>>> 02bdcb7 (Initial commit)02bdcb7 (Initial commit)
