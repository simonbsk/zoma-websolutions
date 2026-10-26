-- ZomaWebsolutions — project requests from the start form (/start)
-- • project_requests: what visitors send through "Your website starts here"
-- • site_events: allows the new 'request_sent' event
-- • experiment_summary: counts requests per headline variant
-- Run after 0002_marketing.sql.

-- ---------------------------------------------------------------------------
-- Project requests
-- ---------------------------------------------------------------------------

create table if not exists public.project_requests (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null check (char_length(btrim(full_name)) between 2 and 120),
  email         text not null
                check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone         text check (phone is null or char_length(phone) between 6 and 40),
  business_name text check (business_name is null or char_length(business_name) <= 160),
  service       text not null
                check (service in ('new-website', 'relaunch', 'fixes', 'shop', 'care', 'other')),
  budget        text not null
                check (budget in ('800-1200', '1200-2000', '2000-3000', '3000-4000', 'flexible')),
  reply_channel text not null check (reply_channel in ('email', 'phone', 'whatsapp', 'video')),
  message       text not null check (char_length(btrim(message)) between 10 and 5000),
  status        text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  source        text check (source is null or char_length(source) <= 40),
  created_at    timestamptz not null default now(),
  -- We can only call or message people who gave us a number.
  constraint project_requests_phone_for_channel
    check (reply_channel in ('email', 'video') or phone is not null)
);

create index if not exists project_requests_created_idx on public.project_requests (created_at desc);

alter table public.project_requests enable row level security;

-- Visitors may send a request (always as 'new') but can never read any.
drop policy if exists "project_requests public insert" on public.project_requests;
create policy "project_requests public insert" on public.project_requests
  for insert to anon, authenticated with check (status = 'new');

drop policy if exists "project_requests admin read" on public.project_requests;
create policy "project_requests admin read" on public.project_requests
  for select to authenticated using (public.is_admin());

drop policy if exists "project_requests admin update" on public.project_requests;
create policy "project_requests admin update" on public.project_requests
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "project_requests admin delete" on public.project_requests;
create policy "project_requests admin delete" on public.project_requests
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Site events: allow 'request_sent'
-- ---------------------------------------------------------------------------

alter table public.site_events drop constraint if exists site_events_name_check;
alter table public.site_events add constraint site_events_name_check
  check (name in ('experiment_view', 'cta_click', 'booking_started', 'booking_completed', 'subscribe', 'request_sent'));

-- ---------------------------------------------------------------------------
-- Experiment summary with requests (the return type changes, so drop first)
-- ---------------------------------------------------------------------------

drop function if exists public.experiment_summary(text, timestamptz);

create function public.experiment_summary(
  p_experiment text,
  p_since timestamptz default now() - interval '90 days'
)
returns table (variant text, views bigint, cta_clicks bigint, bookings bigint, requests bigint)
language sql
stable
security definer
set search_path = public
as $$
  select e.variant,
         count(*) filter (where e.name = 'experiment_view'),
         count(*) filter (where e.name = 'cta_click'),
         count(*) filter (where e.name = 'booking_completed'),
         count(*) filter (where e.name = 'request_sent')
  from public.site_events e
  where public.is_admin()
    and e.experiment = p_experiment
    and e.created_at >= p_since
  group by e.variant
  order by e.variant;
$$;

revoke all on function public.experiment_summary(text, timestamptz) from public;
grant execute on function public.experiment_summary(text, timestamptz) to authenticated;
