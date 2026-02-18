# Fix for admin@bitpandapro.com - Admin Role Issue

## Issue
The user admin@bitpandapro.com was registered as a normal user instead of an admin.

## Root Cause
The `handle_new_user()` trigger creates profiles with `is_admin = false` by default. The `set_admin_role()` function exists but wasn't called for this user.

## Fixes Applied

### 1. SQL to Fix Existing Admin User
Run this in Supabase SQL Editor to make admin@bitpandapro.com an admin:

```sql
-- Find the admin user
SELECT id, email, full_name, is_admin FROM profiles WHERE email = 'admin@bitpandapro.com';

-- Make them admin (replace UUID with actual ID from above query)
UPDATE profiles SET is_admin = true WHERE email = 'admin@bitpandapro.com';

-- Also add to admin_users table if needed
INSERT INTO admin_users (id, email, full_name)
SELECT id, email, full_name FROM profiles WHERE email = 'admin@bitpandapro.com'
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();
```

### 2. Updated handle_new_user() Function
The trigger function has been updated in `supabase-setup.sql` to:
- Check if email matches `admin@*` pattern
- Auto-set `is_admin = true` for admin emails
- Auto-create admin_users record for admin emails

## Verification
After running the SQL fix:
1. Sign out and sign back in
2. Go to /admin/dashboard
3. Verify admin access works

## Prevention
Future admin email registrations will automatically be set as admins because:
- The trigger checks for `admin@` prefix in email
- Sets `is_admin = true` automatically
- Creates admin_users record

