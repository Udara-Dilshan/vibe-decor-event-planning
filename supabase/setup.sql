-- Vibe Decor CMS schema and security policies.
-- Run this in the Supabase SQL Editor for a new project.
-- Important: after creating your owner account in Supabase Auth, add its UUID to public.admin_users.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_vibe_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

grant execute on function public.is_vibe_admin() to anon, authenticated;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null default 'Wedding',
  event_date date,
  location text not null default '',
  short_description text not null default '',
  full_description text not null default '',
  services text[] not null default '{}',
  cover_image text not null default '',
  gallery_images text[] not null default '{}',
  video_urls text[] not null default '{}',
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  image text not null default '',
  icon text not null default 'sparkles',
  offerings text[] not null default '{}',
  sort_order integer not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  event_type text not null default '',
  review text not null,
  rating integer not null default 5 check (rating between 1 and 5),
  photo_url text not null default '',
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  caption text not null default '',
  video_url text not null,
  thumbnail_url text not null default '',
  sort_order integer not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_areas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  sort_order integer not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id text primary key default 'main',
  about_text text not null default '',
  phone text not null default '078 180 0001',
  whatsapp_number text not null default '94781800001',
  email text not null default 'mishakaw@gmail.com',
  address text not null default 'No:06, Badulusirigama, Badulla 90000, Sri Lanka',
  facebook_url text not null default 'https://www.facebook.com/VibeDecorEventPlanning',
  instagram_url text not null default '',
  tagline text not null default 'Every Event Has a Vibe. Make Yours Unforgettable.',
  secondary_tagline text not null default 'Your Event. Your Vibe. Our Responsibility.',
  updated_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.events enable row level security;
alter table public.services enable row level security;
alter table public.testimonials enable row level security;
alter table public.videos enable row level security;
alter table public.service_areas enable row level security;
alter table public.site_settings enable row level security;


-- Explicit grants pair with the RLS policies above (RLS alone does not grant table access).
grant select on public.events, public.services, public.testimonials, public.videos, public.service_areas, public.site_settings to anon, authenticated;
grant select on public.admin_users to authenticated;
grant insert, update, delete on public.events, public.services, public.testimonials, public.videos, public.service_areas, public.site_settings to authenticated;

-- Admin accounts may read their own allowlist row. Do not enable public signups in Auth.
drop policy if exists "admin user can read own row" on public.admin_users;
create policy "admin user can read own row" on public.admin_users for select to authenticated using (user_id = auth.uid());

-- Public website reads published/active content only.
drop policy if exists "public reads published events" on public.events;
create policy "public reads published events" on public.events for select to anon, authenticated using (status = 'published');
drop policy if exists "admins manage events" on public.events;
create policy "admins manage events" on public.events for all to authenticated using (public.is_vibe_admin()) with check (public.is_vibe_admin());

drop policy if exists "public reads active services" on public.services;
create policy "public reads active services" on public.services for select to anon, authenticated using (active = true);
drop policy if exists "admins manage services" on public.services;
create policy "admins manage services" on public.services for all to authenticated using (public.is_vibe_admin()) with check (public.is_vibe_admin());

drop policy if exists "public reads active testimonials" on public.testimonials;
create policy "public reads active testimonials" on public.testimonials for select to anon, authenticated using (active = true);
drop policy if exists "admins manage testimonials" on public.testimonials;
create policy "admins manage testimonials" on public.testimonials for all to authenticated using (public.is_vibe_admin()) with check (public.is_vibe_admin());

drop policy if exists "public reads active videos" on public.videos;
create policy "public reads active videos" on public.videos for select to anon, authenticated using (active = true);
drop policy if exists "admins manage videos" on public.videos;
create policy "admins manage videos" on public.videos for all to authenticated using (public.is_vibe_admin()) with check (public.is_vibe_admin());

drop policy if exists "public reads active service areas" on public.service_areas;
create policy "public reads active service areas" on public.service_areas for select to anon, authenticated using (active = true);
drop policy if exists "admins manage service areas" on public.service_areas;
create policy "admins manage service areas" on public.service_areas for all to authenticated using (public.is_vibe_admin()) with check (public.is_vibe_admin());

drop policy if exists "public reads site settings" on public.site_settings;
create policy "public reads site settings" on public.site_settings for select to anon, authenticated using (true);
drop policy if exists "admins manage site settings" on public.site_settings;
create policy "admins manage site settings" on public.site_settings for all to authenticated using (public.is_vibe_admin()) with check (public.is_vibe_admin());

-- Public bucket for event media. Only allowlisted admins can upload, replace or delete files.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('event-media', 'event-media', true, 20971520, array['image/jpeg','image/png','image/webp','image/avif','image/gif','video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set public = true, file_size_limit = 20971520, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public reads event media" on storage.objects;
create policy "public reads event media" on storage.objects for select to anon, authenticated using (bucket_id = 'event-media');
drop policy if exists "admins upload event media" on storage.objects;
create policy "admins upload event media" on storage.objects for insert to authenticated with check (bucket_id = 'event-media' and public.is_vibe_admin());
drop policy if exists "admins update event media" on storage.objects;
create policy "admins update event media" on storage.objects for update to authenticated using (bucket_id = 'event-media' and public.is_vibe_admin()) with check (bucket_id = 'event-media' and public.is_vibe_admin());
drop policy if exists "admins delete event media" on storage.objects;
create policy "admins delete event media" on storage.objects for delete to authenticated using (bucket_id = 'event-media' and public.is_vibe_admin());

-- English starter brand details; no customer names or invented reviews are seeded.
insert into public.site_settings
  (id, about_text, phone, whatsapp_number, email, address, facebook_url, instagram_url, tagline, secondary_tagline)
values
  ('main',
   'Vibe Decor Event Planning is an event planning and decoration business based in Badulla, Sri Lanka. We help individuals, families, couples, and organizations create meaningful celebrations through thoughtful planning, creative decoration, and reliable event coordination. From intimate gatherings to large occasions, we work to understand your vision and bring it to life with care.',
   '078 180 0001', '94781800001', 'mishakaw@gmail.com',
   'No:06, Badulusirigama, Badulla 90000, Sri Lanka',
   'https://www.facebook.com/VibeDecorEventPlanning', '',
   'Every Event Has a Vibe. Make Yours Unforgettable.',
   'Your Event. Your Vibe. Our Responsibility.')
on conflict (id) do nothing;

-- Convert previously localized starter content to English without changing unrelated records.
-- The Unicode escape range identifies the previously localized Unicode block without embedding localized copy.
update public.site_settings
set about_text = 'Vibe Decor Event Planning is an event planning and decoration business based in Badulla, Sri Lanka. We help individuals, families, couples, and organizations create meaningful celebrations through thoughtful planning, creative decoration, and reliable event coordination. From intimate gatherings to large occasions, we work to understand your vision and bring it to life with care.'
where id = 'main' and about_text ~ U&'[\0D80-\0DFF]';

update public.service_areas
set name = case sort_order
  when 1 then 'Badulla'
  when 2 then 'Bandarawela'
  when 3 then 'Ella'
  when 4 then 'Mahiyanganaya'
  when 5 then 'Passara'
  when 6 then 'Across Uva Province'
  else name
end,
description = case sort_order
  when 1 then 'Our home base'
  when 2 then 'Event planning and decoration'
  when 3 then 'Intimate celebrations and destination occasions'
  when 4 then 'Local event coordination'
  when 5 then 'Event setups and celebrations'
  when 6 then 'Ask us about your location'
  else description
end
where name ~ U&'[\0D80-\0DFF]' or description ~ U&'[\0D80-\0DFF]';

update public.services
set
  title = case sort_order
    when 1 then 'Weddings'
    when 2 then 'Birthdays'
    when 3 then 'Parties & Celebrations'
    when 4 then 'Corporate Events'
    when 5 then 'Religious Events'
    when 6 then 'Full Event Planning'
    else title
  end,
  description = case sort_order
    when 1 then 'Thoughtful details and beautiful styling for the beginning of your next chapter.'
    when 2 then 'Celebrate your favourite people with a setup that feels personal and joyful.'
    when 3 then 'Bring friends and family together for special moments worth remembering.'
    when 4 then 'Well-organized functions designed around your team, guests, and goals.'
    when 5 then 'Respectful, elegant arrangements for meaningful religious occasions.'
    when 6 then 'One coordinated team to help bring your event together from the first idea to the final moment.'
    else description
  end,
  offerings = case sort_order
    when 1 then array['Wedding planning','Wedding decorations','Poruwa arrangements','Wedding car coordination','Cake, photography, and videography coordination','Venue and entertainment coordination']
    when 2 then array['Birthday decorations','Surprise arrangements','Theme setup','Photography and videography coordination','Entertainment']
    when 3 then array['Engagements','Anniversaries','Homecomings','Private parties','Special celebrations']
    when 4 then array['Corporate functions','Event coordination','Venue styling','Entertainment coordination','Event setup']
    when 5 then array['Religious functions','Decorations','Event coordination','Guest and venue setup']
    when 6 then array['Planning and timelines','Supplier coordination','Venue arrangements','Decoration direction','On-the-day coordination']
    else offerings
  end
where title ~ U&'[\0D80-\0DFF]'
   or description ~ U&'[\0D80-\0DFF]'
   or array_to_string(offerings, ' ') ~ U&'[\0D80-\0DFF]';

insert into public.services (title, description, image, icon, offerings, sort_order, active)
select * from (values
  ('Weddings', 'Thoughtful details and beautiful styling for the beginning of your next chapter.', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=85', 'rings', array['Wedding planning','Wedding decorations','Poruwa arrangements','Wedding car coordination','Cake, photography, and videography coordination','Venue and entertainment coordination']::text[], 1, true),
  ('Birthdays', 'Celebrate your favourite people with a setup that feels personal and joyful.', 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1000&q=85', 'cake', array['Birthday decorations','Surprise arrangements','Theme setup','Photography and videography coordination','Entertainment']::text[], 2, true),
  ('Parties & Celebrations', 'Bring friends and family together for special moments worth remembering.', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=85', 'sparkles', array['Engagements','Anniversaries','Homecomings','Private parties','Special celebrations']::text[], 3, true),
  ('Corporate Events', 'Well-organized functions designed around your team, guests, and goals.', 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=85', 'briefcase', array['Corporate functions','Event coordination','Venue styling','Entertainment coordination','Event setup']::text[], 4, true),
  ('Religious Events', 'Respectful, elegant arrangements for meaningful religious occasions.', 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1000&q=85', 'flower', array['Religious functions','Decorations','Event coordination','Guest and venue setup']::text[], 5, true),
  ('Full Event Planning', 'One coordinated team to help bring your event together from the first idea to the final moment.', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=85', 'calendar', array['Planning and timelines','Supplier coordination','Venue arrangements','Decoration direction','On-the-day coordination']::text[], 6, true)
) as seed(title, description, image, icon, offerings, sort_order, active)
where not exists (
  select 1 from public.services existing
  where existing.title = seed.title
);

insert into public.service_areas (name, description, sort_order, active)
select * from (values
  ('Badulla', 'Our home base', 1, true),
  ('Bandarawela', 'Event planning and decoration', 2, true),
  ('Ella', 'Intimate celebrations and destination occasions', 3, true),
  ('Mahiyanganaya', 'Local event coordination', 4, true),
  ('Passara', 'Event setups and celebrations', 5, true),
  ('Across Uva Province', 'Ask us about your location', 6, true)
) as seed(name, description, sort_order, active)
where not exists (select 1 from public.service_areas existing where existing.name = seed.name);

-- After creating the owner account in Authentication > Users, add its UUID:
-- insert into public.admin_users (user_id) values ('PASTE-AUTH-USER-UUID-HERE');
-- Keep public sign-ups disabled in Supabase Auth. Never use the service_role key in the browser.


-- Engagement package management. Package content and prices are based on the supplied Crysenya Events 2026-2 brochure.
create table if not exists public.packages (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  price integer not null default 0 check (price >= 0),
  short_description text not null default '',
  image text not null default '',
  features text[] not null default '{}',
  add_ons text[] not null default '{}',
  decor_note text not null default '',
  transport_note text not null default '',
  sort_order integer not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Also supports adding packages to a table that existed before this update.
alter table public.packages alter column id set default gen_random_uuid()::text;

alter table public.packages enable row level security;
grant select on public.packages to anon, authenticated;
grant insert, update, delete on public.packages to authenticated;
drop policy if exists "public reads active packages" on public.packages;
create policy "public reads active packages" on public.packages for select to anon, authenticated using (active = true);
drop policy if exists "admins manage packages" on public.packages;
create policy "admins manage packages" on public.packages for all to authenticated using (public.is_vibe_admin()) with check (public.is_vibe_admin());

insert into public.packages (id, title, price, short_description, image, features, add_ons, decor_note, transport_note, sort_order, active) values
('package-basic', 'Basic Package', 24500, 'A graceful engagement setup with a classic backdrop and a beautiful pathway.', '/service1.webp',
 array['Basic backdrop (Ring / Hexagon / Rectangular / Arch / Heart / Arrow / Triangular)', 'Pathway (6 flower bunches with white boxes or chair decoration with ribbon)', 'Petals for pathway', 'Basic welcome board'],
 array['Fresh flowers', 'Tiffany chairs', 'Oil lamp', 'Cake pillar', 'Signing chair decoration'],
 'Decorations are done with fresh leaves and artificial flowers.', 'Transport cost will be added.', 1, true),
('package-plus', 'Plus Package', 46500, 'A fuller floral setting with an enhanced backdrop and additional finishing details.', '/hero-bg2.webp',
 array['Full-filled backdrop (Ring / Hexagon / Rectangular / Arch / Heart / Arrow / Triangular)', 'Full-filled pathway', 'Petals for pathway', 'Welcome board (5 ft panel / mirror / wooden)', 'Signing chair decoration for the couple', 'Oil lamp', 'Cake pillar'],
 array['Fresh flowers', 'Tiffany chairs', 'White carpet', 'Champagne fountain'],
 'Decorations are done with fresh leaves and artificial flowers.', 'Transport cost will be added.', 2, true),
('package-premier', 'Premier Package', 66500, 'A statement setup with double backdrops, floral pathway styling, and premium details.', '/service6.webp',
 array['Double backdrops or two-panel backdrops (Ring / Rectangular / Arch / Heart / Arrow / Triangular)', 'Pathway decoration (full floral decoration with two side pillars and flower bunches)', 'White carpet', 'Petals for pathway', 'Welcome board with side decorations', 'Signing chair decoration for the couple', 'Oil lamp', 'Cake pillar', '17 Tiffany chairs', 'Ring box', 'Selfie mirror'],
 array['Fresh flowers', 'Champagne fountain', 'Base platform for backdrop (8 ft x 8 ft)', 'Platform for pathway', 'LOVE structure'],
 'Decorations are done with fresh leaves and artificial flowers.', 'Transport cost will be added.', 3, true)
on conflict (id) do nothing;
