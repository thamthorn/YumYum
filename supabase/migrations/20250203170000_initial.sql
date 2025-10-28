-- Enable required extensions
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- Enumerations
create type public.account_role as enum ('buyer', 'oem', 'admin');
create type public.organization_type as enum ('buyer', 'oem');
create type public.verification_tier as enum ('none', 'verified', 'certified', 'trusted_partner');
create type public.scale_type as enum ('small', 'medium', 'large');
create type public.match_status as enum (
  'new_match',
  'contacted',
  'in_discussion',
  'quote_requested',
  'declined',
  'archived'
);
create type public.request_type as enum ('quote', 'prototype');
create type public.request_status as enum (
  'draft',
  'submitted',
  'pending_oem',
  'quote_received',
  'in_review',
  'accepted',
  'in_production',
  'completed',
  'cancelled'
);
create type public.order_status as enum (
  'signed',
  'preparation',
  'manufacturing',
  'delivering',
  'completed',
  'cancelled'
);
create type public.order_event_type as enum (
  'status_change',
  'note',
  'file_upload',
  'payment',
  'logistics'
);

-- Reference tables
create table public.industries (
  key text primary key,
  label text not null
);

create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default timezone('utc', now())
);

-- Utility functions
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.account_role not null default 'buyer',
  display_name text,
  first_name text,
  last_name text,
  phone text,
  timezone text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_app_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger public_handle_new_user
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Organizations
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug citext unique,
  type public.organization_type not null,
  display_name text not null,
  industry text references public.industries(key),
  website text,
  description text,
  logo_url text,
  location text,
  country_code text,
  established_year integer,
  headcount_range text,
  owner_id uuid references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index organizations_type_owner_idx on public.organizations (type, owner_id);

create trigger organizations_updated_at
before update on public.organizations
for each row
execute function public.set_updated_at();

-- Organization members
create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_in_org text not null default 'member',
  invited_at timestamptz,
  accepted_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (organization_id, profile_id)
);

create index organization_members_profile_idx on public.organization_members (profile_id);

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.organization_members m
      where m.organization_id = org_id
        and m.profile_id = auth.uid()
    );
$$;

create or replace function public.is_org_type_member(org_id uuid, expected public.organization_type)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.organization_members m
      join public.organizations o on o.id = m.organization_id
      where m.organization_id = org_id
        and m.profile_id = auth.uid()
        and o.type = expected
    );
$$;

-- Buyer tables
create table public.buyer_profiles (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  company_name text,
  company_size text,
  annual_volume_estimate numeric,
  preferred_currency text,
  cross_border boolean,
  prototype_needed boolean,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger buyer_profiles_updated_at
before update on public.buyer_profiles
for each row
execute function public.set_updated_at();

create table public.buyer_preferences (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.buyer_profiles(organization_id) on delete cascade,
  product_type text,
  moq_min integer,
  moq_max integer,
  timeline text,
  location_preference text,
  prototype_needed boolean,
  cross_border boolean,
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index buyer_preferences_org_uidx
on public.buyer_preferences (organization_id);

create trigger buyer_preferences_updated_at
before update on public.buyer_preferences
for each row
execute function public.set_updated_at();

create table public.buyer_certifications (
  buyer_org_id uuid not null references public.buyer_profiles(organization_id) on delete cascade,
  certification_id uuid not null references public.certifications(id),
  importance text not null default 'nice_to_have',
  created_at timestamptz not null default timezone('utc', now()),
  primary key (buyer_org_id, certification_id)
);

create table public.buyer_saved_oems (
  buyer_org_id uuid not null references public.organizations(id) on delete cascade,
  oem_org_id uuid not null references public.organizations(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (buyer_org_id, oem_org_id)
);

-- OEM tables
create table public.oem_profiles (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  scale public.scale_type,
  moq_min integer,
  moq_max integer,
  lead_time_days integer,
  response_time_hours integer,
  prototype_support boolean,
  short_description text,
  cross_border boolean,
  rating numeric,
  total_reviews integer,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger oem_profiles_updated_at
before update on public.oem_profiles
for each row
execute function public.set_updated_at();

create table public.oem_services (
  oem_org_id uuid not null references public.oem_profiles(organization_id) on delete cascade,
  service_id uuid not null references public.services(id),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (oem_org_id, service_id)
);

create table public.oem_certifications (
  oem_org_id uuid not null references public.oem_profiles(organization_id) on delete cascade,
  certification_id uuid not null references public.certifications(id),
  verified boolean not null default false,
  verification_tier public.verification_tier not null default 'none',
  verified_at timestamptz,
  verifier_id uuid references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (oem_org_id, certification_id)
);

create table public.oem_languages (
  oem_org_id uuid not null references public.oem_profiles(organization_id) on delete cascade,
  language_code text not null,
  proficiency text,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (oem_org_id, language_code)
);

create table public.oem_previous_products (
  id uuid primary key default gen_random_uuid(),
  oem_org_id uuid not null references public.oem_profiles(organization_id) on delete cascade,
  title text not null,
  image_url text,
  tags text[],
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

-- Matching & requests
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  buyer_org_id uuid not null references public.organizations(id) on delete cascade,
  oem_org_id uuid not null references public.organizations(id) on delete cascade,
  status public.match_status not null default 'new_match',
  score numeric,
  source text,
  digest jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  last_viewed_at timestamptz
);

create unique index matches_unique_pair on public.matches (buyer_org_id, oem_org_id);

create trigger matches_updated_at
before update on public.matches
for each row
execute function public.set_updated_at();

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  buyer_org_id uuid not null references public.organizations(id) on delete cascade,
  oem_org_id uuid not null references public.organizations(id) on delete cascade,
  type public.request_type not null default 'quote',
  status public.request_status not null default 'submitted',
  title text,
  product_brief text,
  quantity_min integer,
  quantity_max integer,
  unit text,
  timeline text,
  shipping_terms text,
  payment_terms text,
  add_escrow boolean,
  add_audit boolean,
  submitted_at timestamptz,
  resolved_at timestamptz,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index requests_buyer_idx on public.requests (buyer_org_id, created_at desc);
create index requests_oem_idx on public.requests (oem_org_id, created_at desc);

create trigger requests_updated_at
before update on public.requests
for each row
execute function public.set_updated_at();

create table public.request_files (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  bucket text not null,
  path text not null,
  mime_type text,
  size_bytes integer,
  uploaded_by uuid references public.profiles(id),
  uploaded_at timestamptz not null default timezone('utc', now())
);

create table public.request_updates (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  status public.request_status,
  note text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now())
);

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_org_id uuid not null references public.organizations(id) on delete cascade,
  oem_org_id uuid not null references public.organizations(id) on delete cascade,
  request_id uuid references public.requests(id),
  status public.order_status not null default 'signed',
  total_value numeric(12, 2),
  currency text not null default 'THB',
  quantity_total integer,
  unit text,
  shipping_provider text,
  tracking_number text,
  production_start_date date,
  estimated_delivery_date date,
  actual_delivery_date date,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index orders_buyer_idx on public.orders (buyer_org_id, status);
create index orders_oem_idx on public.orders (oem_org_id, status);

create trigger orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

create table public.order_line_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  sku text,
  description text,
  quantity integer,
  unit text,
  unit_price numeric(12, 2),
  currency text,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  stage public.order_status,
  event_type public.order_event_type not null,
  payload jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now())
);

create index order_events_order_idx on public.order_events (order_id, created_at desc);

create table public.order_documents (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  bucket text not null,
  path text not null,
  title text,
  uploaded_by uuid references public.profiles(id),
  uploaded_at timestamptz not null default timezone('utc', now())
);

-- Views
create or replace view public.buyer_dashboard_stats as
select
  b.organization_id as buyer_org_id,
  count(distinct r.id) filter (where r.status <> 'cancelled') as request_count,
  count(distinct m.id) as match_count,
  count(distinct o.id) as order_count
from public.buyer_profiles b
left join public.requests r on r.buyer_org_id = b.organization_id
left join public.matches m on m.buyer_org_id = b.organization_id
left join public.orders o on o.buyer_org_id = b.organization_id
group by b.organization_id;

create or replace view public.oem_dashboard_stats as
select
  o.organization_id as oem_org_id,
  count(distinct r.id) as request_count,
  count(distinct ord.id) filter (where ord.status <> 'cancelled') as active_orders,
  avg(ord.total_value) as average_order_value
from public.oem_profiles o
left join public.requests r on r.oem_org_id = o.organization_id
left join public.orders ord on ord.oem_org_id = o.organization_id
group by o.organization_id;

create or replace view public.active_orders as
select
  ord.*,
  oe.stage as current_stage,
  oe.created_at as stage_updated_at
from public.orders ord
left join lateral (
  select e.stage, e.created_at
  from public.order_events e
  where e.order_id = ord.id
  order by e.created_at desc
  limit 1
) as oe on true;

-- Row Level Security
alter table public.industries enable row level security;
alter table public.certifications enable row level security;
alter table public.services enable row level security;
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.buyer_profiles enable row level security;
alter table public.buyer_preferences enable row level security;
alter table public.buyer_certifications enable row level security;
alter table public.buyer_saved_oems enable row level security;
alter table public.oem_profiles enable row level security;
alter table public.oem_services enable row level security;
alter table public.oem_certifications enable row level security;
alter table public.oem_languages enable row level security;
alter table public.oem_previous_products enable row level security;
alter table public.matches enable row level security;
alter table public.requests enable row level security;
alter table public.request_files enable row level security;
alter table public.request_updates enable row level security;
alter table public.orders enable row level security;
alter table public.order_line_items enable row level security;
alter table public.order_events enable row level security;
alter table public.order_documents enable row level security;

-- Reference data can be read by everyone
create policy "Industries readable by all" on public.industries
for select using (true);

create policy "Certifications readable by all" on public.certifications
for select using (true);

create policy "Services readable by all" on public.services
for select using (true);

-- Profiles
create policy "Profiles viewable by owner or admin" on public.profiles
for select using (auth.uid() = id or public.is_admin());

create policy "Profiles updatable by owner" on public.profiles
for update using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Profiles insertable by owner" on public.profiles
for insert with check (auth.uid() = id);

-- Organizations
create policy "Organizations readable to members" on public.organizations
for select using (public.is_org_member(id));

create policy "Organizations insert requires owner" on public.organizations
for insert with check (auth.uid() = owner_id or public.is_admin());

create policy "Organizations updatable by owner" on public.organizations
for update using (
  public.is_admin() or exists (
    select 1
    from public.organization_members m
    where m.organization_id = organizations.id
      and m.profile_id = auth.uid()
      and m.role_in_org in ('owner', 'admin')
  )
)
with check (
  public.is_admin() or exists (
    select 1
    from public.organization_members m
    where m.organization_id = organizations.id
      and m.profile_id = auth.uid()
      and m.role_in_org in ('owner', 'admin')
  )
);

-- Organization members
create policy "Org members readable to members" on public.organization_members
for select using (public.is_org_member(organization_id));

create policy "Org members insertable by owners" on public.organization_members
for insert with check (
  public.is_admin() or exists (
    select 1
    from public.organization_members m
    where m.organization_id = organization_members.organization_id
      and m.profile_id = auth.uid()
      and m.role_in_org in ('owner', 'admin')
  )
);

create policy "Org members deletable by owners" on public.organization_members
for delete using (
  public.is_admin() or exists (
    select 1
    from public.organization_members m
    where m.organization_id = organization_members.organization_id
      and m.profile_id = auth.uid()
      and m.role_in_org in ('owner', 'admin')
  )
);

-- Buyer scoped data
create policy "Buyer profiles accessible to members" on public.buyer_profiles
for all using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "Buyer preferences accessible to members" on public.buyer_preferences
for all using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "Buyer certifications accessible to members" on public.buyer_certifications
for all using (public.is_org_member(buyer_org_id))
with check (public.is_org_member(buyer_org_id));

create policy "Buyer saved OEMs accessible to members" on public.buyer_saved_oems
for all using (public.is_org_member(buyer_org_id))
with check (public.is_org_member(buyer_org_id));

-- OEM scoped data
create policy "OEM profiles accessible to members" on public.oem_profiles
for all using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "OEM services accessible to members" on public.oem_services
for all using (public.is_org_member(oem_org_id))
with check (public.is_org_member(oem_org_id));

create policy "OEM certifications accessible to members" on public.oem_certifications
for all using (public.is_org_member(oem_org_id))
with check (public.is_org_member(oem_org_id));

create policy "OEM languages accessible to members" on public.oem_languages
for all using (public.is_org_member(oem_org_id))
with check (public.is_org_member(oem_org_id));

create policy "OEM previous products accessible to members" on public.oem_previous_products
for all using (public.is_org_member(oem_org_id))
with check (public.is_org_member(oem_org_id));

-- Matches
create policy "Matches accessible to involved orgs" on public.matches
for all using (
  public.is_org_member(buyer_org_id) or public.is_org_member(oem_org_id)
)
with check (
  public.is_org_member(buyer_org_id) or public.is_org_member(oem_org_id)
);

-- Requests
create policy "Requests accessible to involved orgs" on public.requests
for all using (
  public.is_org_member(buyer_org_id) or public.is_org_member(oem_org_id)
)
with check (
  public.is_org_member(buyer_org_id)
);

-- Request files & updates
create policy "Request files accessible to involved orgs" on public.request_files
for all using (
  public.is_org_member(
    (select r.buyer_org_id from public.requests r where r.id = request_files.request_id)
  ) or public.is_org_member(
    (select r.oem_org_id from public.requests r where r.id = request_files.request_id)
  )
)
with check (
  public.is_org_member(
    (select r.buyer_org_id from public.requests r where r.id = request_files.request_id)
  )
);

create policy "Request updates accessible to involved orgs" on public.request_updates
for all using (
  public.is_org_member(
    (select r.buyer_org_id from public.requests r where r.id = request_updates.request_id)
  ) or public.is_org_member(
    (select r.oem_org_id from public.requests r where r.id = request_updates.request_id)
  )
)
with check (
  public.is_org_member(
    (select r.buyer_org_id from public.requests r where r.id = request_updates.request_id)
  ) or public.is_org_member(
    (select r.oem_org_id from public.requests r where r.id = request_updates.request_id)
  )
);

-- Orders
create policy "Orders accessible to involved orgs" on public.orders
for all using (
  public.is_org_member(buyer_org_id) or public.is_org_member(oem_org_id)
)
with check (
  public.is_org_member(buyer_org_id)
);

create policy "Order line items accessible to involved orgs" on public.order_line_items
for all using (
  public.is_org_member(
    (select o.buyer_org_id from public.orders o where o.id = order_line_items.order_id)
  ) or public.is_org_member(
    (select o.oem_org_id from public.orders o where o.id = order_line_items.order_id)
  )
)
with check (
  public.is_org_member(
    (select o.buyer_org_id from public.orders o where o.id = order_line_items.order_id)
  ) or public.is_org_member(
    (select o.oem_org_id from public.orders o where o.id = order_line_items.order_id)
  )
);

create policy "Order events accessible to involved orgs" on public.order_events
for all using (
  public.is_org_member(
    (select o.buyer_org_id from public.orders o where o.id = order_events.order_id)
  ) or public.is_org_member(
    (select o.oem_org_id from public.orders o where o.id = order_events.order_id)
  )
)
with check (
  public.is_org_member(
    (select o.buyer_org_id from public.orders o where o.id = order_events.order_id)
  ) or public.is_org_member(
    (select o.oem_org_id from public.orders o where o.id = order_events.order_id)
  )
);

create policy "Order documents accessible to involved orgs" on public.order_documents
for all using (
  public.is_org_member(
    (select o.buyer_org_id from public.orders o where o.id = order_documents.order_id)
  ) or public.is_org_member(
    (select o.oem_org_id from public.orders o where o.id = order_documents.order_id)
  )
)
with check (
  public.is_org_member(
    (select o.buyer_org_id from public.orders o where o.id = order_documents.order_id)
  ) or public.is_org_member(
    (select o.oem_org_id from public.orders o where o.id = order_documents.order_id)
  )
);
