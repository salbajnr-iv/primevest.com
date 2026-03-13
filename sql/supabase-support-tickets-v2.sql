-- Support tickets user scoping, states, and replies
ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS open_at timestamptz,
  ADD COLUMN IF NOT EXISTS pending_at timestamptz,
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz,
  ADD COLUMN IF NOT EXISTS closed_at timestamptz;

UPDATE public.support_tickets
SET open_at = COALESCE(open_at, created_at)
WHERE status = 'open';

CREATE TABLE IF NOT EXISTS public.support_ticket_replies (
  id bigserial PRIMARY KEY,
  ticket_id bigint NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  message text NOT NULL,
  is_staff boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS support_tickets_user_id_idx ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS support_tickets_status_idx ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS support_tickets_updated_at_idx ON public.support_tickets(updated_at DESC);
CREATE INDEX IF NOT EXISTS support_ticket_replies_ticket_id_idx ON public.support_ticket_replies(ticket_id, created_at);
