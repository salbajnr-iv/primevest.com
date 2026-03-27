-- Performance optimization: Adding indexes for frequent queries on ledger, balances, and audit logs.

BEGIN;

-- Ledger Entries: Frequently filtered by wallet_id and sorted by created_at
CREATE INDEX IF NOT EXISTS idx_ledger_entries_wallet_id ON public.ledger_entries(wallet_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_created_at ON public.ledger_entries(created_at DESC);

-- Balance History: Frequently filtered by user_id for admin/user views
CREATE INDEX IF NOT EXISTS idx_balance_history_user_id ON public.balance_history(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_history_created_at ON public.balance_history(created_at DESC);

-- Admin Actions: Frequently filtered by target_user_id or admin_id
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_user_id ON public.admin_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON public.admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON public.admin_actions(created_at DESC);

-- Profiles: Ensure email and status are indexed for lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email_ilike ON public.profiles USING gin (email gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_kyc_status ON public.profiles(kyc_status);

COMMIT;
