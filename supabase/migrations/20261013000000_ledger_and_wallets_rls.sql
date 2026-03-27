-- Migration: Full Financial Schema and RLS Hardening
-- Creates missing tables from Backendguide.md and tightens RLS to prevent direct client-side balance updates.

BEGIN;

-- 1) Ledger Entries table: Immutable record of all balance changes.
CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL, 
  user_id uuid REFERENCES public.profiles(id),
  asset text NOT NULL,
  network text NOT NULL,
  amount numeric(24,8) NOT NULL,
  balance_after numeric(24,8) NOT NULL,
  type text NOT NULL,
  reference_id uuid,
  idempotency_key text,
  metadata jsonb DEFAULT '{}',
  status text DEFAULT 'confirmed',
  created_at timestamptz DEFAULT now()
);

-- 2) Ledger Idempotency table: Prevents double-spending and duplicate operations.
CREATE TABLE IF NOT EXISTS public.ledger_idempotency (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key text UNIQUE NOT NULL,
  payload jsonb,
  result jsonb,
  created_at timestamptz DEFAULT now()
);

-- 3) Enable RLS on financial tables.
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_idempotency ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 4) Harden Wallets RLS: USERS READ-ONLY.
-- Administrative changes (adjustments) must bypass RLS via Service Role.
DROP POLICY IF EXISTS wallets_owner_or_admin_all ON public.wallets;
DROP POLICY IF EXISTS "Users can view own wallets" ON public.wallets;

CREATE POLICY "Wallets view own" ON public.wallets 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Wallets admin view all" ON public.wallets 
  FOR SELECT USING (EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- 5) Harden Transactions RLS: USERS READ-ONLY.
DROP POLICY IF EXISTS transactions_owner_or_admin_all ON public.transactions;

CREATE POLICY "Transactions view own" ON public.transactions 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Transactions admin view all" ON public.transactions 
  FOR SELECT USING (EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- 6) Ledger Entries RLS: USERS READ-ONLY.
DROP POLICY IF EXISTS "Ledger view own" ON public.ledger_entries;

CREATE POLICY "Ledger view own" ON public.ledger_entries 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Ledger admin view all" ON public.ledger_entries 
  FOR SELECT USING (EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

COMMIT;
