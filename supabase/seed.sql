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
  ('Website-Strategiegespräch', 'website-strategy-call',
   'Ein fokussiertes Gespräch, um Ziele, Zielgruppe, Umfang und den passenden technischen Ansatz für Ihre neue Website festzulegen.',
   45, 0, 'landing', 1),
  ('Unternehmenswebsite', 'business-website',
   'Planungstermin für eine individuelle, auf Conversion ausgerichtete Unternehmenswebsite — Design, Textstruktur und Launch-Plan.',
   60, 0, 'brand', 2),
  ('Onlineshop', 'e-commerce-store',
   'Planen Sie einen schnellen, vertrauenswürdigen Onlineshop: Sortiment, Checkout, Zahlungen und Versandablauf.',
   60, 0, 'ecommerce', 3),
  ('Web-App & Dashboard', 'web-app-dashboard',
   'Produktplanung für individuelle Portale, Buchungssysteme und interne Tools auf einem modernen Technologie-Stack.',
   90, 0, 'webapp', 4),
  ('SEO- & Performance-Audit', 'seo-performance-audit',
   'Eine Analyse Ihrer aktuellen Website: Ladezeit, Core Web Vitals, Barrierefreiheit und Sichtbarkeit in Suchmaschinen.',
   45, 0, 'seo', 5),
  ('Betreuung & Wartung', 'care-maintenance',
   'Besprechen Sie laufende Updates, Monitoring, Backups und schrittweise Verbesserungen für eine bestehende Website.',
   30, 0, 'care', 6)
) as v(name, slug, description, duration_minutes, price_cents, visual, sort_order)
where not exists (select 1 from public.services);
