-- Optional starter configuration. Edit freely — everything is manageable in the admin dashboard.
-- Contains no appointments.

insert into public.webdesign_settings (
  business_name, business_email, business_phone, business_address,
  timezone, slot_interval_minutes, booking_notice_hours, max_advance_days
)
select 'ZomaWebsolutions', 'zomawebsolutions@proton.me', null, null,
       'Europe/Berlin', 30, 24, 60
where not exists (select 1 from public.webdesign_settings);

-- Monday (1) to Friday (5), 09:00–17:00
insert into public.business_hours (weekday, is_open, start_time, end_time)
select d, true, '09:00', '17:00'
from generate_series(1, 5) as d
where not exists (select 1 from public.business_hours);

insert into public.services (name, slug, description, duration_minutes, price_cents, visual, sort_order)
select * from (values
  ('Website Strategy Call', 'website-strategy-call',
   'A focused session to define goals, audience, scope and the right technical approach for your new website.',
   45, 0, 'landing', 1),
  ('Business Website', 'business-website',
   'Planning session for a bespoke, conversion-focused marketing website — design, copy structure and launch plan.',
   60, 0, 'brand', 2),
  ('E-Commerce Store', 'e-commerce-store',
   'Scope a fast, trustworthy online store: catalogue, checkout, payments and fulfilment workflow.',
   60, 0, 'ecommerce', 3),
  ('Web App & Dashboard', 'web-app-dashboard',
   'Product discovery for custom portals, booking systems and internal tools built on a modern stack.',
   90, 0, 'webapp', 4),
  ('SEO & Performance Audit', 'seo-performance-audit',
   'A walkthrough of your current site''s speed, Core Web Vitals, accessibility and search visibility.',
   45, 0, 'seo', 5),
  ('Care & Maintenance', 'care-maintenance',
   'Discuss ongoing updates, monitoring, backups and iterative improvements for an existing site.',
   30, 0, 'care', 6)
) as v(name, slug, description, duration_minutes, price_cents, visual, sort_order)
where not exists (select 1 from public.services);

-- Typical project prices (made-up starting points — adjust in the admin).
-- Only applies once 0002_marketing.sql has added the column.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'services' and column_name = 'project_from_cents'
  ) then
    update public.services s
    set project_from_cents = v.cents
    from (values
      ('business-website', 240000),
      ('e-commerce-store', 480000),
      ('web-app-dashboard', 900000),
      ('seo-performance-audit', 60000)
    ) as v(slug, cents)
    where s.slug = v.slug and s.project_from_cents is null;
  end if;
end $$;
