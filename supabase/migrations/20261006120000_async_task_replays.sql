create table if not exists public.async_task_replays (
  id uuid primary key default gen_random_uuid(),
  task_type text not null,
  replay_key text not null,
  status text not null default 'processing' check (status in ('processing', 'completed', 'failed')),
  response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create unique index if not exists async_task_replays_task_replay_key_idx
  on public.async_task_replays (task_type, replay_key);

alter table public.async_task_replays enable row level security;

create policy "Service role manages async task replays"
  on public.async_task_replays
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create trigger handle_async_task_replays_updated_at
  before update on public.async_task_replays
  for each row execute function public.handle_updated_at();
