-- Support contact submissions
create table if not exists public.support_tickets (
  id bigserial primary key,
  reference_id text not null unique,
  name text not null,
  email text not null,
  category text not null,
  subject text,
  message text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create index if not exists support_tickets_created_at_idx on public.support_tickets (created_at desc);
create index if not exists support_tickets_email_idx on public.support_tickets (email);
