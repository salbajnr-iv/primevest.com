-- Ensure core application tables exist for clean deployments.
-- These tables are referenced in the Next.js app and API routes.

CREATE TABLE IF NOT EXISTS public.balances (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset text NOT NULL,
  available numeric(24, 8) NOT NULL DEFAULT 0,
  locked numeric(24, 8) NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, asset)
);

CREATE INDEX IF NOT EXISTS idx_balances_user_id ON public.balances(user_id);
CREATE INDEX IF NOT EXISTS idx_balances_asset ON public.balances(asset);

ALTER TABLE public.balances ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'balances'
      AND policyname = 'users_select_own_balances'
  ) THEN
    CREATE POLICY users_select_own_balances
      ON public.balances
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;


CREATE TABLE IF NOT EXISTS public.notifications (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  message text NOT NULL,
  action text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT notifications_type_check CHECK (type IN ('success', 'warning', 'info', 'promo'))
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created_at ON public.notifications(user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'notifications'
      AND policyname = 'users_select_own_notifications'
  ) THEN
    CREATE POLICY users_select_own_notifications
      ON public.notifications
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'notifications'
      AND policyname = 'users_update_own_notifications'
  ) THEN
    CREATE POLICY users_update_own_notifications
      ON public.notifications
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;


CREATE TABLE IF NOT EXISTS public.reports (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'custom',
  size text,
  icon text,
  file_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reports_type_check CHECK (type IN ('tax', 'annual', 'custom', 'activity'))
);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_created_at ON public.reports(user_id, created_at DESC);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'reports'
      AND policyname = 'users_select_own_reports'
  ) THEN
    CREATE POLICY users_select_own_reports
      ON public.reports
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;
