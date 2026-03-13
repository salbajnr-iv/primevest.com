# Admin Console Implementation TODO

> **Source of truth:** This file is legacy for task tracking. Track all open items in `docs/TASK_PLAN.md`.

## Phase 1: Database Setup ✅ COMPLETED
- [x] 1.1 Update supabase-setup.sql with admin tables (admin_users, admin_actions, balance_history)
- [x] 1.2 Create RLS policies for admin access
- [x] 1.3 Create SQL function to set admin role
- [x] 1.4 Create sample admin user

## Phase 2: Admin Authentication ✅ COMPLETED
- [x] 2.1 Create AdminAuthContext in contexts/
- [x] 2.2 Create admin sign-in page at /app/admin/auth/signin/page.tsx
- [x] 2.3 Create admin middleware protection
- [x] 2.4 Update root middleware for admin routes

## Phase 3: Admin Layout & Dashboard ✅ COMPLETED
- [x] 3.1 Create admin layout at /app/admin/layout.tsx
- [x] 3.2 Create admin sidebar component
- [x] 3.3 Create admin dashboard page at /app/admin/dashboard/page.tsx
- [x] 3.4 Create admin header component

## Phase 4: User Management ✅ COMPLETED
- [x] 4.1 Create users list page at /app/admin/users/page.tsx
- [x] 4.2 Create user detail page at /app/admin/users/[id]/page.tsx
- [x] 4.3 Create balance adjustment modal/component (in users page)
- [x] 4.4 Create user status toggle component (in users page)

## Phase 5: Balance History & Audit ✅ COMPLETED
- [x] 5.1 Create balance history page at /app/admin/balances/page.tsx
- [x] 5.2 Create audit log page at /app/admin/audit/page.tsx

## Phase 6: Additional Admin Pages ✅ COMPLETED
- [x] 6.1 Create transactions page at /app/admin/transactions/page.tsx
- [x] 6.2 Create settings page at /app/admin/settings/page.tsx

## Phase 7: Subdomain Configuration ✅ COMPLETED
- [x] 7.1 Configure next.config.ts for subdomain redirects
- [x] 7.2 Update middleware for admin route handling

## Phase 8: Deployment Instructions
- [ ] 8.1 Run `sql/supabase-setup.sql`, `sql/supabase-migration-2024.sql`, and `sql/supabase-fix-profile-upsert.sql` in order
- [ ] 8.2 Run post-migration validation queries (tables/functions/policies)
- [ ] 8.3 Create at least one real admin user via `public.set_admin_role(...)`
- [ ] 8.4 Verify deployment env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- [ ] 8.5 Confirm admin route host strategy (`/admin` and optional `admin.bitpandaproapp.com`)

## Status: Track completion directly in the checklist above.

> Detailed reproducible rollout + rollback instructions are documented in `docs/SUPABASE_ADMIN_MIGRATION_RUNBOOK.md`.

---

# 🚀 DEPLOYMENT INSTRUCTIONS

## Step 1: Update Database

1. Go to your Supabase Dashboard → SQL Editor
2. Follow `docs/SUPABASE_ADMIN_MIGRATION_RUNBOOK.md` and run all three SQL scripts in order
3. Run the validation query block from the runbook
4. **Create your first admin user:**
   - First, create a user account via your app's signup page
   - Then in Supabase SQL Editor, run:
     ```sql
     SELECT public.set_admin_role('YOUR-USER-UUID-HERE');
     ```
   - To find the user UUID, run: `SELECT id, email, full_name FROM profiles;`

## Step 2: Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
4. Deploy

## Step 3: Configure Subdomain

1. In Vercel, go to Settings → Domains
2. Add `admin.bitpandaproapp.com`
3. Point it to your main deployment
4. Wait for DNS propagation

## Admin Console Features

✅ **Dashboard** - Overview stats and quick actions
✅ **User Management** - View, search, filter users
✅ **Balance Adjustment** - Add/reduce user balances
✅ **User Status** - Activate/deactivate users
✅ **Balance History** - Track all balance changes
✅ **Audit Log** - Track all admin actions
✅ **Transactions** - View user transactions
✅ **Settings** - Configure platform settings

## Access Admin Console

- **URL:** https://your-domain/admin
- **Subdomain:** https://admin.bitpandaproapp.com
- **Login:** Separate admin authentication

