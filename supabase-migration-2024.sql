-- =============================================================================
-- Admin Dashboard Fixes - Complete Migration Script
-- Run this in Supabase SQL Editor to fix all issues
-- =============================================================================

-- IMPORTANT: Read the notes at the end before running!

-- =============================================================================
-- PART 0: Fix Existing Admin User (admin@bitpandapro.com)
-- =============================================================================

-- This fixes the issue where admin@bitpandapro.com was registered as a normal user
-- Instead of an admin due to the trigger not detecting admin emails

-- First, update the existing admin user's is_admin flag
UPDATE profiles SET is_admin = true WHERE email = 'admin@bitpandapro.com';

-- Also add to admin_users table if not exists
INSERT INTO admin_users (id, email, full_name)
SELECT id, email, full_name FROM profiles WHERE email = 'admin@bitpandapro.com'
ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();

-- Verify the fix
SELECT id, email, full_name, is_admin FROM profiles WHERE email = 'admin@bitpandapro.com';

-- =============================================================================
-- PART 1: Fix Profile Creation Trigger (if needed)
-- =============================================================================

-- First, check if handle_new_user function exists, if not create it
-- Also update existing function to auto-detect admin emails
DO $$
BEGIN
    -- Always recreate the function with admin detection logic
    EXECUTE $$
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    DECLARE
        v_is_admin BOOLEAN;
        v_email TEXT;
    BEGIN
        -- Get email from metadata or from NEW.email
        v_email := COALESCE(NEW.raw_user_meta_data->>'email', NEW.email);
        
        -- Check if email matches admin pattern
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
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    $$;
END $$;

-- Check if trigger exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
    ) THEN
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- =============================================================================
-- PART 2: Create/Recreate Database Functions
-- =============================================================================

-- Drop existing functions if they exist (for clean recreation)
DROP FUNCTION IF EXISTS public.adjust_balance(UUID, TEXT, DECIMAL, TEXT);
DROP FUNCTION IF EXISTS public.toggle_user_status(UUID, BOOLEAN);
DROP FUNCTION IF EXISTS public.get_user_stats();
DROP FUNCTION IF EXISTS public.search_users(TEXT, TEXT, BOOLEAN, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS public.get_admin_settings();
DROP FUNCTION IF EXISTS public.update_admin_settings(JSONB);
DROP FUNCTION IF EXISTS public.reset_all_balances();
DROP FUNCTION IF EXISTS public.deactivate_all_users();

-- adjust_balance function - Fixed version with proper parameter names
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
    
    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
        RAISE EXCEPTION 'User not found';
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

-- toggle_user_status function
CREATE OR REPLACE FUNCTION public.toggle_user_status(
    user_id UUID,
    is_active BOOLEAN
) RETURNS VOID AS $$
DECLARE
    v_admin_id UUID;
BEGIN
    v_admin_id := auth.uid();
    
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_admin_id AND is_admin = true) THEN
        RAISE EXCEPTION 'Only admins can toggle user status';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    UPDATE profiles SET is_active = is_active, updated_at = NOW() WHERE id = user_id;
    
    INSERT INTO admin_actions (admin_id, action_type, target_user_id, target_table, new_value)
    VALUES (v_admin_id, 'user_status_change', user_id, 'profiles', 
            jsonb_build_object('is_active', is_active));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- get_user_stats function
CREATE OR REPLACE FUNCTION public.get_user_stats()
RETURNS TABLE (
    total_users BIGINT,
    active_users BIGINT,
    inactive_users BIGINT,
    total_balance DECIMAL(20, 8),
    avg_balance DECIMAL(20, 8)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_users,
        COUNT(*) FILTER (WHERE is_active = true)::BIGINT as active_users,
        COUNT(*) FILTER (WHERE is_active = false)::BIGINT as inactive_users,
        COALESCE(SUM(balance), 0)::DECIMAL(20, 8) as total_balance,
        COALESCE(AVG(balance), 0)::DECIMAL(20, 8) as avg_balance
    FROM profiles;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- search_users function
CREATE OR REPLACE FUNCTION public.search_users(
    p_search_term TEXT DEFAULT '',
    p_status_filter TEXT DEFAULT 'all',
    p_is_admin_filter BOOLEAN DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    balance DECIMAL(20, 8),
    is_active BOOLEAN,
    is_admin BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        p.full_name,
        p.balance,
        p.is_active,
        p.is_admin,
        p.created_at,
        COUNT(*) OVER()::BIGINT as total_count
    FROM profiles p
    WHERE 
        (p_search_term = '' OR 
         p.email ILIKE '%' || p_search_term || '%' OR
         p.full_name ILIKE '%' || p_search_term || '%')
        AND (p_status_filter = 'all' OR 
             (p_status_filter = 'active' AND p.is_active = true) OR
             (p_status_filter = 'inactive' AND p.is_active = false))
        AND (p_is_admin_filter IS NULL OR p.is_admin = p_is_admin_filter)
    ORDER BY p.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- admin_settings table (for storing admin settings)
CREATE TABLE IF NOT EXISTS admin_settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for admin_settings
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view admin_settings
CREATE POLICY "Admins can view admin_settings" ON admin_settings
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Policy: Only admins can update admin_settings
CREATE POLICY "Admins can update admin_settings" ON admin_settings
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Initialize default settings if not exists
INSERT INTO admin_settings (id, settings)
VALUES ('global', '{
    "requireEmailConfirmation": true,
    "allowUserRegistration": true,
    "maxWithdrawalLimit": 10000,
    "notifyOnLargeTransactions": true,
    "largeTransactionThreshold": 5000,
    "sessionTimeout": 60
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- get_admin_settings function
CREATE OR REPLACE FUNCTION public.get_admin_settings()
RETURNS JSONB AS $$
DECLARE
    v_settings JSONB;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
        RAISE EXCEPTION 'Only admins can view settings';
    END IF;
    
    SELECT settings INTO v_settings FROM admin_settings WHERE id = 'global';
    
    -- Return empty object if no settings found
    IF v_settings IS NULL THEN
        v_settings := '{}'::jsonb;
    END IF;
    
    RETURN v_settings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- update_admin_settings function
CREATE OR REPLACE FUNCTION public.update_admin_settings(p_settings JSONB)
RETURNS JSONB AS $$
DECLARE
    v_admin_id UUID;
    v_old_settings JSONB;
BEGIN
    v_admin_id := auth.uid();
    
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_admin_id AND is_admin = true) THEN
        RAISE EXCEPTION 'Only admins can update settings';
    END IF;
    
    SELECT settings INTO v_old_settings FROM admin_settings WHERE id = 'global';
    
    UPDATE admin_settings 
    SET settings = p_settings, updated_at = NOW() 
    WHERE id = 'global';
    
    -- Log admin action
    INSERT INTO admin_actions (admin_id, action_type, target_table, old_value, new_value)
    VALUES (v_admin_id, 'settings_update', 'admin_settings', v_old_settings, p_settings);
    
    RETURN p_settings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- reset_all_balances function (danger zone)
CREATE OR REPLACE FUNCTION public.reset_all_balances()
RETURNS VOID AS $$
DECLARE
    v_admin_id UUID;
BEGIN
    v_admin_id := auth.uid();
    
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_admin_id AND is_admin = true) THEN
        RAISE EXCEPTION 'Only admins can reset balances';
    END IF;
    
    -- Update all balances to zero
    UPDATE profiles SET balance = 0, updated_at = NOW();
    
    -- Log admin action
    INSERT INTO admin_actions (admin_id, action_type, target_table, new_value)
    VALUES (v_admin_id, 'mass_reset_balances', 'profiles', 
            jsonb_build_object('action', 'reset_all_balances'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- deactivate_all_users function (danger zone)
CREATE OR REPLACE FUNCTION public.deactivate_all_users()
RETURNS VOID AS $$
DECLARE
    v_admin_id UUID;
BEGIN
    v_admin_id := auth.uid();
    
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_admin_id AND is_admin = true) THEN
        RAISE EXCEPTION 'Only admins can deactivate users';
    END IF;
    
    -- Deactivate all non-admin users
    UPDATE profiles SET is_active = false, updated_at = NOW() WHERE is_admin = false;
    
    -- Log admin action
    INSERT INTO admin_actions (admin_id, action_type, target_table, new_value)
    VALUES (v_admin_id, 'mass_deactivate_users', 'profiles', 
            jsonb_build_object('action', 'deactivate_all_non_admins'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- PART 3: Fix RLS Policies for Better User Visibility
-- =============================================================================

-- First, drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create more permissive policies
-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Policy: Admins can update any profile
CREATE POLICY "Admins can update profiles" ON profiles
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- =============================================================================
-- PART 4: Create Transactions Table (if not exists)
-- =============================================================================

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'trade', 'transfer', 'fee', 'adjustment')),
    amount DECIMAL(20, 8) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EUR',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    description TEXT,
    reference_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Admins can view all transactions
CREATE POLICY "Admins can view all transactions" ON transactions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Create indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- =============================================================================
-- PART 5: Additional Indexes for Performance
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON profiles(full_name);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- =============================================================================
-- VERIFICATION: Check what's been created
-- =============================================================================

-- List all policies
SELECT 
    policyname, 
    tablename, 
    cmd, 
    CASE WHEN qual IS NOT NULL THEN substring(qual, 1, 100) ELSE 'no condition' END as condition
FROM pg_policies 
WHERE tablename IN ('profiles', 'transactions', 'admin_settings', 'balance_history', 'admin_actions')
ORDER BY tablename, policyname;

-- List all functions
SELECT 
    proname as function_name,
    pg_get_function_arguments(oid) as arguments
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname IN ('adjust_balance', 'toggle_user_status', 'get_user_stats', 
                 'search_users', 'get_admin_settings', 'update_admin_settings',
                 'reset_all_balances', 'deactivate_all_users')
ORDER BY proname;

-- =============================================================================
-- HOW TO MAKE YOURSELF AN ADMIN
-- =============================================================================

-- Step 1: Find your user ID
-- Run: SELECT id, email, full_name FROM profiles;

-- Step 2: Make yourself admin (replace YOUR_USER_ID with your actual UUID)
-- SELECT public.set_admin_role('YOUR_USER_ID');

-- OR use this direct method:
-- UPDATE profiles SET is_admin = true WHERE id = 'YOUR_USER_ID';

-- =============================================================================
-- TESTING STEPS AFTER RUNNING THIS SCRIPT
-- =============================================================================

-- 1. Sign out and sign back in to refresh your session
-- 2. Go to Admin Dashboard → Users
-- 3. Verify all users are showing
-- 4. Try adjusting a user's balance
-- 5. Check Balance History page
-- 6. Check Audit Log page

-- =============================================================================
-- TROUBLESHOOTING
-- =============================================================================

-- If users still don't show up:
-- 1. Check RLS: SELECT * FROM pg_policies WHERE tablename = 'profiles';
-- 2. Verify your admin status: SELECT is_admin FROM profiles WHERE id = auth.uid();
-- 3. Check for profile creation issues: SELECT * FROM profiles;

-- If adjust_balance fails:
-- 1. Verify function exists: SELECT proname FROM pg_proc WHERE proname = 'adjust_balance';
-- 2. Check you're an admin: SELECT is_admin FROM profiles WHERE id = auth.uid();
-- 3. Try manually: SELECT public.adjust_balance('user-uuid', 'add', 100, 'test');

