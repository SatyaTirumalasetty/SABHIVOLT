-- SABHIVOLT database schema. Run this in Supabase SQL Editor.

create table if not exists site_content (
  key text primary key,
  content jsonb not null,
  updated_at timestamptz default now()
);
alter table site_content enable row level security;

create policy "Anyone can read site content"
  on site_content for select using (true);
create policy "Admins can insert site content"
  on site_content for insert with check (auth.role() = 'authenticated');
create policy "Admins can update site content"
  on site_content for update using (auth.role() = 'authenticated');

create table if not exists enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  interest text,
  message text,
  read boolean default false,
  created_at timestamptz default now()
);
alter table enquiries enable row level security;

create policy "Anyone can submit an enquiry"
  on enquiries for insert with check (true);
create policy "Admins can read enquiries"
  on enquiries for select using (auth.role() = 'authenticated');
create policy "Admins can update enquiries"
  on enquiries for update using (auth.role() = 'authenticated');
create policy "Admins can delete enquiries"
  on enquiries for delete using (auth.role() = 'authenticated');
