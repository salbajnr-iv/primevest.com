# Admin Dashboard Fixes - TODO List

## Phase 1: Database Setup (SQL Migration) ✅ COMPLETED
- [x] 1.1 Create SQL migration file with all database functions
- [x] 1.2 Create transactions table (if missing)
- [x] 1.3 Create admin_settings table for settings persistence
- [x] 1.4 Fix RLS policies for better user visibility
- [x] 1.5 Create proper indexes for performance

## Phase 2: Frontend Fixes ✅ COMPLETED
- [x] 2.1 Fix users page - improve search and pagination
- [x] 2.2 Fix balance adjustment error handling
- [x] 2.3 Implement settings page with real database storage
- [x] 2.4 Add error toasts/notifications for better UX
- [x] 2.5 Fix dashboard stats queries

## Phase 3: Database Functions Created ✅ COMPLETED
- [x] `adjust_balance` - Add/subtract/set/reset user balance
- [x] `toggle_user_status` - Activate/deactivate users
- [x] `get_user_stats` - Get user statistics for dashboard
- [x] `search_users` - Search users with filters
- [x] `get_admin_settings` - Get admin settings
- [x] `update_admin_settings` - Update admin settings
- [x] `reset_all_balances` - Danger zone action (admin only)
- [x] `deactivate_all_users` - Danger zone action (admin only)

## Phase 4: Testing & Validation ⏳ PENDING
- [ ] 4.1 Test user list shows all users
- [ ] 4.2 Test balance adjustment works
- [ ] 4.3 Test user activation/deactivation
- [ ] 4.4 Test settings save/load
- [ ] 4.5 Verify audit logging works

## Files Created/Modified:
- `supabase-migration-2024.sql` - Complete SQL migration script
- `app/admin/users/page.tsx` - Fixed with debounced search and toasts
- `app/admin/settings/page.tsx` - Connected to real database
- `app/admin/dashboard/page.tsx` - Better stats fetching with fallback
- `ADMIN_FIXES_TODO.md` - This file

## Quick Start for Supabase
After applying the SQL migration:
1. Go to Supabase Dashboard → SQL Editor
2. Copy and run the contents of `supabase-migration-2024.sql`
3. Make yourself admin: `SELECT public.set_admin_role('your-user-id');`
4. Test the admin dashboard

