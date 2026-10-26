-- ZomaWebsolutions — marketing features
-- • project "from" prices on services
-- • checklist / newsletter subscribers
-- • anonymous site events for the hero headline A/B test
-- Run after 0001_init.sql.

-- ---------------------------------------------------------------------------
-- Services: typical project price ("Projects from €2,400")
-- ---------------------------------------------------------------------------

alter table public.services
  add column if not exists project_from_cents integer
  check (project_from_cents is null or project_from_cents >= 0);

-- ---------------------------------------------------------------------------
-- Subscribers
-- ---------------------------------------------------------------------------

create table if not exists public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique
             check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  source     text not null default 'footer' check (char_length(source) <= 40),
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;

-- Visitors may add themselves but can never read the list.
drop policy if exists "subscribers public insert" on public.subscribers;
create policy "subscribers public insert" on public.subscribers
  for insert to anon, authenticated with check (true);

drop policy if exists "subscribers admin read" on public.subscribers;
create policy "subscribers admin read" on public.subscribers
  for select to authenticated using (public.is_admin());

drop policy if exists "subscribers admin delete" on public.subscribers;
create policy "subscribers admin delete" on public.subscribers
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Site events — no personal data, no visitor identifiers
-- ---------------------------------------------------------------------------

create table if not exists public.site_events (
  id         bigint generated always as identity primary key,
  name       text not null
             check (name in ('experiment_view', 'cta_click', 'booking_started', 'booking_completed', 'subscribe')),
  experiment text check (experiment is null or char_length(experiment) <= 40),
  variant    text check (variant is null or char_length(variant) <= 40),
  created_at timestamptz not null default now()
);

create index if not exists site_events_experiment_idx on public.site_events (experiment, variant, name);

alter table public.site_events enable row level security;

drop policy if exists "site_events public insert" on public.site_events;
create policy "site_events public insert" on public.site_events
  for insert to anon, authenticated with check (true);

drop policy if exists "site_events admin read" on public.site_events;
create policy "site_events admin read" on public.site_events
  for select to authenticated using (public.is_admin());

-- Per-variant results for the admin overview.
create or replace function public.experiment_summary(
  p_experiment text,
  p_since timestamptz default now() - interval '90 days'
)
returns table (variant text, views bigint, cta_clicks bigint, bookings bigint)
language sql
stable
security definer
set search_path = public
as $$
  select e.variant,
         count(*) filter (where e.name = 'experiment_view'),
         count(*) filter (where e.name = 'cta_click'),
         count(*) filter (where e.name = 'booking_completed')
  from public.site_events e
  where public.is_admin()
    and e.experiment = p_experiment
    and e.created_at >= p_since
  group by e.variant
  order by e.variant;
$$;

revoke all on function public.experiment_summary(text, timestamptz) from public;
grant execute on function public.experiment_summary(text, timestamptz) to authenticated;
