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

create policy "Admins can read enquiries"
  on enquiries for select using (auth.role() = 'authenticated');
create policy "Admins can update enquiries"
  on enquiries for update using (auth.role() = 'authenticated');
create policy "Admins can delete enquiries"
  on enquiries for delete using (auth.role() = 'authenticated');

-- Public submission goes through a SECURITY DEFINER function so the browser
-- never needs INSERT/SELECT rights on the table directly. It returns only the
-- new row id, which the /api/notify function re-reads server-side.
create or replace function public.submit_enquiry(
  p_name text,
  p_phone text,
  p_email text,
  p_interest text,
  p_message text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'name is required';
  end if;
  insert into enquiries (name, phone, email, interest, message)
  values (trim(p_name), p_phone, p_email, p_interest, p_message)
  returning id into new_id;
  return new_id;
end;
$$;

grant execute on function public.submit_enquiry(text, text, text, text, text) to anon, authenticated;
