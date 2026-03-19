-- Local/dev seed for dashboard and wallet verification.
--
-- Seeded browser user credentials:
--   email: dashboard-user@primevest.local
--   password: Primevest123!
--
-- The dashboard summary path reads public.profiles where id = auth.users.id.
-- This seed keeps the seeded balance on that exact public.profiles(id) row.

BEGIN;

DO $$
DECLARE
  v_dashboard_user_id CONSTANT uuid := '77777777-7777-7777-7777-777777777777';
  v_admin_user_id CONSTANT uuid := '88888888-8888-8888-8888-888888888888';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_dashboard_user_id) THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      v_dashboard_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'dashboard-user@primevest.local',
      crypt('Primevest123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Dashboard Seed User"}'::jsonb,
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET email = 'dashboard-user@primevest.local',
        raw_user_meta_data = jsonb_build_object('full_name', 'Dashboard Seed User'),
        updated_at = now()
    WHERE id = v_dashboard_user_id;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_admin_user_id) THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      v_admin_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'admin@bitpandapro.com',
      crypt('Primevest123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Primevest Admin"}'::jsonb,
      now(),
      now()
    );
  END IF;
END $$;

INSERT INTO public.profiles (
  id,
  email,
  full_name,
  is_admin,
  is_active,
  kyc_status,
  account_balance
)
VALUES (
  '77777777-7777-7777-7777-777777777777',
  'dashboard-user@primevest.local',
  'Dashboard Seed User',
  false,
  true,
  'verified',
  25000
)
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    is_admin = EXCLUDED.is_admin,
    is_active = EXCLUDED.is_active,
    kyc_status = EXCLUDED.kyc_status,
    account_balance = EXCLUDED.account_balance,
    updated_at = now();

INSERT INTO public.profiles (
  id,
  email,
  full_name,
  is_admin,
  is_active,
  kyc_status,
  account_balance
)
VALUES (
  '88888888-8888-8888-8888-888888888888',
  'admin@bitpandapro.com',
  'Primevest Admin',
  true,
  true,
  'verified',
  0
)
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    is_admin = EXCLUDED.is_admin,
    is_active = EXCLUDED.is_active,
    kyc_status = EXCLUDED.kyc_status,
    account_balance = EXCLUDED.account_balance,
    updated_at = now();

INSERT INTO public.wallets (user_id, asset, balance, available_balance, locked_balance)
VALUES ('77777777-7777-7777-7777-777777777777', 'EUR', 25000, 25000, 0)
ON CONFLICT (user_id, asset) DO UPDATE
SET balance = EXCLUDED.balance,
    available_balance = EXCLUDED.available_balance,
    locked_balance = EXCLUDED.locked_balance,
    updated_at = now();

COMMIT;
