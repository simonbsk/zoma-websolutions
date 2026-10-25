-- ZomaWebsolutions — initial schema
-- Run once in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id               uuid primary key default gen_random_uuid(),
  name             text not null check (char_length(name) between 2 and 120),
  slug             text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description      text not null default '',
  duration_minutes integer not null check (duration_minutes between 5 and 600),
  price_cents      integer not null default 0 check (price_cents >= 0),
  currency         text not null default 'EUR' check (char_length(currency) = 3),
  visual           text not null default 'landing'
                   check (visual in ('landing', 'ecommerce', 'brand', 'webapp', 'seo', 'care')),
  is_active        boolean not null default true,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists public.appointments (
  id               uuid primary key default gen_random_uuid(),
  service_id       uuid not null references public.services (id) on delete restrict,
  full_name        text not null check (char_length(full_name) between 2 and 120),
  email            text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone            text not null check (char_length(phone) between 5 and 40),
  appointment_date date not null,
  start_time       time not null,
  end_time         time not null,
  status           text not null default 'pending'
                   check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  notes            text check (notes is null or char_length(notes) <= 2000),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  check (end_time > start_time)
);

create index if not exists appointments_date_idx on public.appointments (appointment_date, start_time);
create index if not exists appointments_status_idx on public.appointments (status);

create table if not exists public.business_hours (
  id         uuid primary key default gen_random_uuid(),
  weekday    smallint not null check (weekday between 0 and 6), -- 0 = Sunday … 6 = Saturday
  is_open    boolean not null default true,
  start_time time not null,
  end_time   time not null,
  check (end_time > start_time)
);

create index if not exists business_hours_weekday_idx on public.business_hours (weekday);

create table if not exists public.blocked_dates (
  id           uuid primary key default gen_random_uuid(),
  blocked_date date not null,
  start_time   time,           -- null start & end = whole day blocked
  end_time     time,
  reason       text,
  created_at   timestamptz not null default now(),
  check ((start_time is null and end_time is null) or (start_time is not null and end_time is not null and end_time > start_time))
);

create index if not exists blocked_dates_date_idx on public.blocked_dates (blocked_date);

create table if not exists public.webdesign_settings (
  id                    uuid primary key default gen_random_uuid(),
  business_name         text not null default 'ZomaWebsolutions',
  business_email        text,
  business_phone        text,
  business_address      text,
  timezone              text not null default 'Europe/Berlin',
  slot_interval_minutes integer not null default 30 check (slot_interval_minutes between 5 and 240),
  booking_notice_hours  integer not null default 24 check (booking_notice_hours between 0 and 720),
  max_advance_days      integer not null default 60 check (max_advance_days between 1 and 730),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Single-row table: enforce at most one settings row.
create unique index if not exists webdesign_settings_singleton on public.webdesign_settings ((true));

drop trigger if exists services_updated_at on public.services;
create trigger services_updated_at before update on public.services
  for each row execute function public.set_updated_at();

drop trigger if exists appointments_updated_at on public.appointments;
create trigger appointments_updated_at before update on public.appointments
  for each row execute function public.set_updated_at();

drop trigger if exists webdesign_settings_updated_at on public.webdesign_settings;
create trigger webdesign_settings_updated_at before update on public.webdesign_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Admin check
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.admin_users        enable row level security;
alter table public.services           enable row level security;
alter table public.appointments       enable row level security;
alter table public.business_hours     enable row level security;
alter table public.blocked_dates      enable row level security;
alter table public.webdesign_settings enable row level security;

-- admin_users: a signed-in user may see only their own membership row.
-- Rows are managed via SQL only (no insert/update/delete policies).
drop policy if exists "admin_users self read" on public.admin_users;
create policy "admin_users self read" on public.admin_users
  for select to authenticated using (user_id = auth.uid());

-- services
drop policy if exists "services public read" on public.services;
create policy "services public read" on public.services
  for select using (is_active or public.is_admin());
drop policy if exists "services admin write" on public.services;
create policy "services admin write" on public.services
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- appointments: admin only. Public bookings go through create_appointment().
drop policy if exists "appointments admin all" on public.appointments;
create policy "appointments admin all" on public.appointments
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- business_hours
drop policy if exists "business_hours public read" on public.business_hours;
create policy "business_hours public read" on public.business_hours
  for select using (true);
drop policy if exists "business_hours admin write" on public.business_hours;
create policy "business_hours admin write" on public.business_hours
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- blocked_dates
drop policy if exists "blocked_dates public read" on public.blocked_dates;
create policy "blocked_dates public read" on public.blocked_dates
  for select using (true);
drop policy if exists "blocked_dates admin write" on public.blocked_dates;
create policy "blocked_dates admin write" on public.blocked_dates
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- webdesign_settings
drop policy if exists "settings public read" on public.webdesign_settings;
create policy "settings public read" on public.webdesign_settings
  for select using (true);
drop policy if exists "settings admin write" on public.webdesign_settings;
create policy "settings admin write" on public.webdesign_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Public RPC: booked time ranges (no personal data)
-- ---------------------------------------------------------------------------

create or replace function public.get_booked_ranges(p_from date, p_to date)
returns table (appointment_date date, start_time time, end_time time)
language sql
stable
security definer
set search_path = public
as $$
  select a.appointment_date, a.start_time, a.end_time
  from public.appointments a
  where a.appointment_date between p_from and p_to
    and a.status <> 'cancelled'
    and p_to - p_from <= 62;
$$;

revoke all on function public.get_booked_ranges(date, date) from public;
grant execute on function public.get_booked_ranges(date, date) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Public RPC: create an appointment with full server-side validation
-- ---------------------------------------------------------------------------

create or replace function public.create_appointment(
  p_service_id uuid,
  p_date       date,
  p_start_time time,
  p_full_name  text,
  p_email      text,
  p_phone      text,
  p_notes      text default null
)
returns public.appointments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_service   public.services;
  v_settings  public.webdesign_settings;
  v_now_local timestamp;
  v_start     timestamp;
  v_end       timestamp;
  v_row       public.appointments;
begin
  select * into v_service from public.services where id = p_service_id and is_active;
  if not found then
    raise exception 'SERVICE_UNAVAILABLE' using errcode = 'P0001';
  end if;

  select * into v_settings from public.webdesign_settings limit 1;
  if not found then
    raise exception 'BOOKING_NOT_CONFIGURED' using errcode = 'P0001';
  end if;

  if p_date is null or p_start_time is null then
    raise exception 'INVALID_SLOT' using errcode = 'P0001';
  end if;

  v_start := p_date + p_start_time;
  v_end   := v_start + make_interval(mins => v_service.duration_minutes);

  if v_end::date <> p_date then
    raise exception 'INVALID_SLOT' using errcode = 'P0001';
  end if;

  -- Serialise bookings per day so two requests can never take the same slot.
  perform pg_advisory_xact_lock(hashtext('appointments:' || p_date::text));

  v_now_local := now() at time zone v_settings.timezone;

  if v_start < v_now_local + make_interval(hours => v_settings.booking_notice_hours) then
    raise exception 'NOTICE_TOO_SHORT' using errcode = 'P0001';
  end if;

  if p_date > v_now_local::date + v_settings.max_advance_days then
    raise exception 'TOO_FAR_AHEAD' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from public.business_hours h
    where h.weekday = extract(dow from p_date)
      and h.is_open
      and h.start_time <= p_start_time
      and h.end_time >= v_end::time
  ) then
    raise exception 'OUTSIDE_HOURS' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.blocked_dates b
    where b.blocked_date = p_date
      and (
        b.start_time is null
        or (p_start_time < b.end_time and v_end::time > b.start_time)
      )
  ) then
    raise exception 'DATE_BLOCKED' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.appointments a
    where a.appointment_date = p_date
      and a.status <> 'cancelled'
      and p_start_time < a.end_time
      and v_end::time > a.start_time
  ) then
    raise exception 'SLOT_TAKEN' using errcode = 'P0001';
  end if;

  insert into public.appointments (
    service_id, full_name, email, phone, appointment_date, start_time, end_time, status, notes
  ) values (
    p_service_id,
    trim(p_full_name),
    lower(trim(p_email)),
    trim(p_phone),
    p_date,
    p_start_time,
    v_end::time,
    'pending',
    nullif(trim(coalesce(p_notes, '')), '')
  )
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.create_appointment(uuid, date, time, text, text, text, text) from public;
grant execute on function public.create_appointment(uuid, date, time, text, text, text, text) to anon, authenticated;
