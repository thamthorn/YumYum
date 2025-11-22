-- Migration: Add 3-Tier Subscription System & Platform Enhancements
-- Date: 2025-02-07
-- Description: Adds subscription tiers, OEM capabilities, enhanced certifications,
--              product images, analytics, and inspection booking features

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Subscription tiers
do $$ begin
  create type public.subscription_tier as enum ('FREE', 'INSIGHTS', 'VERIFIED_PARTNER');
exception
  when duplicate_object then null;
end $$;

-- Subscription status
do $$ begin
  create type public.subscription_status as enum ('ACTIVE', 'CANCELLED', 'PENDING', 'PAST_DUE');
exception
  when duplicate_object then null;
end $$;

-- OEM profile status
do $$ begin
  create type public.oem_profile_status as enum (
    'UNREGISTERED',
    'REGISTERED',
    'DRAFT',
    'INCOMPLETE',
    'ACTIVE',
    'VERIFIED_PENDING',
    'VERIFIED'
  );
exception
  when duplicate_object then null;
end $$;

-- Inspection booking status
do $$ begin
  create type public.inspection_status as enum ('PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED');
exception
  when duplicate_object then null;
end $$;

-- Analytics event types
do $$ begin
  create type public.analytics_event_type as enum (
    'PROFILE_VIEW',
    'CONTACT_CLICK',
    'RFQ_SENT',
    'PRODUCT_VIEW',
    'SAVE_OEM',
    'UNSAVE_OEM'
  );
exception
  when duplicate_object then null;
end $$;

-- Certification types (standardized)
do $$ begin
  create type public.certification_type as enum (
    'GMP',
    'ISO_9001',
    'ISO_22716',
    'HALAL',
    'ORGANIC',
    'FDA_THAILAND',
    'OTHER'
  );
exception
  when duplicate_object then null;
end $$;

-- ============================================================================
-- ENHANCE EXISTING TABLES
-- ============================================================================

-- Add new fields to oem_profiles
alter table public.oem_profiles add column if not exists company_name_th text;
alter table public.oem_profiles add column if not exists line_id text;
alter table public.oem_profiles add column if not exists wechat_id text;
alter table public.oem_profiles add column if not exists moq_skincare integer;
alter table public.oem_profiles add column if not exists moq_haircare integer;
alter table public.oem_profiles add column if not exists moq_supplements integer;
alter table public.oem_profiles add column if not exists moq_makeup integer;
alter table public.oem_profiles add column if not exists profile_status public.oem_profile_status not null default 'REGISTERED';
alter table public.oem_profiles add column if not exists verified_at timestamptz;
alter table public.oem_profiles add column if not exists contact_person text;
alter table public.oem_profiles add column if not exists contact_email text;
alter table public.oem_profiles add column if not exists contact_phone text;

-- Add fields to products table
alter table public.products add column if not exists lead_time_days integer;
alter table public.products add column if not exists price_min numeric(10,2);
alter table public.products add column if not exists price_max numeric(10,2);
alter table public.products add column if not exists moq integer;

-- Update oem_certifications to use new enum and add more fields
alter table public.oem_certifications add column if not exists certification_type public.certification_type;
alter table public.oem_certifications add column if not exists file_url text;
alter table public.oem_certifications add column if not exists expiry_date date;
alter table public.oem_certifications add column if not exists notes text;

-- ============================================================================
-- NEW TABLES
-- ============================================================================

-- OEM Capabilities
create table if not exists public.oem_capabilities (
  oem_org_id uuid primary key references public.oem_profiles(organization_id) on delete cascade,
  has_rd boolean not null default false,
  has_packaging boolean not null default false,
  has_formula_library boolean not null default false,
  has_white_label boolean not null default false,
  has_export_experience boolean not null default false,
  languages text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'oem_capabilities_updated_at') then
    create trigger oem_capabilities_updated_at
    before update on public.oem_capabilities
    for each row
    execute function public.set_updated_at();
  end if;
end $$;

-- Product Images
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  display_order integer not null default 0,
  alt_text text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists product_images_product_id_idx on public.product_images(product_id);
create index if not exists product_images_order_idx on public.product_images(product_id, display_order);

-- Subscriptions
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  oem_org_id uuid not null references public.oem_profiles(organization_id) on delete cascade,
  tier public.subscription_tier not null default 'FREE',
  status public.subscription_status not null default 'ACTIVE',
  stripe_subscription_id text unique,
  stripe_customer_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists subscriptions_oem_org_idx on public.subscriptions(oem_org_id);
create index if not exists subscriptions_tier_idx on public.subscriptions(tier);
create index if not exists subscriptions_stripe_customer_idx on public.subscriptions(stripe_customer_id);

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'subscriptions_updated_at') then
    create trigger subscriptions_updated_at
    before update on public.subscriptions
    for each row
    execute function public.set_updated_at();
  end if;
end $$;

-- Inspection Bookings (for Verified Partner tier)
create table if not exists public.inspection_bookings (
  id uuid primary key default gen_random_uuid(),
  oem_org_id uuid not null references public.oem_profiles(organization_id) on delete cascade,
  scheduled_date timestamptz,
  status public.inspection_status not null default 'PENDING',
  inspector_id uuid references public.profiles(id),
  report_url text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists inspection_bookings_oem_idx on public.inspection_bookings(oem_org_id);
create index if not exists inspection_bookings_status_idx on public.inspection_bookings(status);

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'inspection_bookings_updated_at') then
    create trigger inspection_bookings_updated_at
    before update on public.inspection_bookings
    for each row
    execute function public.set_updated_at();
  end if;
end $$;

-- OEM Analytics Events (for tracking user interactions)
create table if not exists public.oem_analytics_events (
  id uuid primary key default gen_random_uuid(),
  oem_org_id uuid not null references public.oem_profiles(organization_id) on delete cascade,
  event_type public.analytics_event_type not null,
  user_id uuid references public.profiles(id),
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists oem_analytics_events_oem_idx on public.oem_analytics_events(oem_org_id);
create index if not exists oem_analytics_events_type_idx on public.oem_analytics_events(event_type);
create index if not exists oem_analytics_events_created_idx on public.oem_analytics_events(created_at desc);
create index if not exists oem_analytics_events_oem_type_idx on public.oem_analytics_events(oem_org_id, event_type);

-- OEM Keyword Traffic (for SEO/search insights)
create table if not exists public.oem_keyword_traffic (
  id uuid primary key default gen_random_uuid(),
  oem_org_id uuid not null references public.oem_profiles(organization_id) on delete cascade,
  keyword text not null,
  count integer not null default 1,
  date date not null default current_date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists oem_keyword_traffic_unique_idx on public.oem_keyword_traffic(oem_org_id, keyword, date);
create index if not exists oem_keyword_traffic_oem_idx on public.oem_keyword_traffic(oem_org_id);
create index if not exists oem_keyword_traffic_date_idx on public.oem_keyword_traffic(date desc);

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'oem_keyword_traffic_updated_at') then
    create trigger oem_keyword_traffic_updated_at
    before update on public.oem_keyword_traffic
    for each row
    execute function public.set_updated_at();
  end if;
end $$;

-- OEM Media (for videos - Factory Tour, QC Process)
create table if not exists public.oem_media (
  id uuid primary key default gen_random_uuid(),
  oem_org_id uuid not null references public.oem_profiles(organization_id) on delete cascade,
  media_type text not null, -- 'factory_tour', 'qc_process', 'product_demo', etc.
  title text not null,
  video_url text,
  thumbnail_url text,
  external_link text, -- YouTube/Vimeo embed
  duration_seconds integer,
  file_size_mb numeric(10,2),
  display_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists oem_media_oem_idx on public.oem_media(oem_org_id);
create index if not exists oem_media_type_idx on public.oem_media(media_type);

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'oem_media_updated_at') then
    create trigger oem_media_updated_at
    before update on public.oem_media
    for each row
    execute function public.set_updated_at();
  end if;
end $$;

-- OEM Profile Drafts (auto-save during wizard)
create table if not exists public.oem_profile_drafts (
  oem_org_id uuid primary key references public.oem_profiles(organization_id) on delete cascade,
  draft_data jsonb not null default '{}',
  step text, -- 'products', 'capabilities', 'categories', 'moq', 'certifications'
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'oem_profile_drafts_updated_at') then
    create trigger oem_profile_drafts_updated_at
    before update on public.oem_profile_drafts
    for each row
    execute function public.set_updated_at();
  end if;
end $$;

-- Saved OEMs (Buyer saves OEMs for later)
create table if not exists public.saved_oems (
  id uuid primary key default gen_random_uuid(),
  buyer_org_id uuid not null references public.organizations(id) on delete cascade,
  oem_org_id uuid not null references public.oem_profiles(organization_id) on delete cascade,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  unique(buyer_org_id, oem_org_id)
);

create index if not exists saved_oems_buyer_idx on public.saved_oems(buyer_org_id);
create index if not exists saved_oems_oem_idx on public.saved_oems(oem_org_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check OEM profile completeness
create or replace function public.check_oem_profile_completeness(org_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_has_products boolean;
  v_has_basic_info boolean;
  v_has_category boolean;
  v_has_moq boolean;
begin
  -- Check if has at least 1 product with image
  select exists(
    select 1
    from public.products p
    where p.oem_org_id = org_id
    and exists(
      select 1 from public.product_images pi where pi.product_id = p.id
    )
  ) into v_has_products;

  -- Check basic company info
  select exists(
    select 1
    from public.oem_profiles op
    join public.organizations o on o.id = op.organization_id
    where op.organization_id = org_id
    and o.display_name is not null
    and op.company_name_th is not null
    and o.country_code is not null
    and op.contact_email is not null
  ) into v_has_basic_info;

  -- Check if has at least 1 category
  select exists(
    select 1
    from public.oem_services
    where oem_org_id = org_id
  ) into v_has_category;

  -- Check if has at least 1 MOQ field filled
  select exists(
    select 1
    from public.oem_profiles
    where organization_id = org_id
    and (
      moq_skincare is not null or
      moq_haircare is not null or
      moq_supplements is not null or
      moq_makeup is not null
    )
  ) into v_has_moq;

  return v_has_products and v_has_basic_info and v_has_category and v_has_moq;
end;
$$;

-- Function to get OEM subscription tier
create or replace function public.get_oem_tier(org_id uuid)
returns public.subscription_tier
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select tier
      from public.subscriptions
      where oem_org_id = org_id
      and status = 'ACTIVE'
      limit 1
    ),
    'FREE'::public.subscription_tier
  );
$$;

-- Function to check if OEM has access to insights
create or replace function public.oem_has_insights_access(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_oem_tier(org_id) in ('INSIGHTS', 'VERIFIED_PARTNER');
$$;

-- Function to log analytics event
create or replace function public.log_analytics_event(
  p_oem_org_id uuid,
  p_event_type public.analytics_event_type,
  p_user_id uuid default null,
  p_metadata jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id uuid;
begin
  insert into public.oem_analytics_events (oem_org_id, event_type, user_id, metadata)
  values (p_oem_org_id, p_event_type, p_user_id, p_metadata)
  returning id into v_event_id;
  
  return v_event_id;
end;
$$;

-- Function to increment keyword traffic
create or replace function public.increment_keyword_traffic(
  p_oem_org_id uuid,
  p_keyword text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.oem_keyword_traffic (oem_org_id, keyword, count, date)
  values (p_oem_org_id, p_keyword, 1, current_date)
  on conflict (oem_org_id, keyword, date)
  do update set
    count = oem_keyword_traffic.count + 1,
    updated_at = timezone('utc', now());
end;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on new tables
alter table public.oem_capabilities enable row level security;
alter table public.product_images enable row level security;
alter table public.subscriptions enable row level security;
alter table public.inspection_bookings enable row level security;
alter table public.oem_analytics_events enable row level security;
alter table public.oem_keyword_traffic enable row level security;
alter table public.oem_media enable row level security;
alter table public.oem_profile_drafts enable row level security;
alter table public.saved_oems enable row level security;

-- OEM Capabilities policies
drop policy if exists "OEM capabilities are publicly readable" on public.oem_capabilities;
create policy "OEM capabilities are publicly readable"
  on public.oem_capabilities for select
  using (true);

drop policy if exists "OEM owners can manage their capabilities" on public.oem_capabilities;
create policy "OEM owners can manage their capabilities"
  on public.oem_capabilities for all
  using (public.is_org_member(oem_org_id));

-- Product Images policies
drop policy if exists "Product images are publicly readable" on public.product_images;
create policy "Product images are publicly readable"
  on public.product_images for select
  using (true);

drop policy if exists "OEM owners can manage their product images" on public.product_images;
create policy "OEM owners can manage their product images"
  on public.product_images for all
  using (
    exists(
      select 1 from public.products p
      where p.id = product_id
      and public.is_org_member(p.oem_org_id)
    )
  );

-- Subscriptions policies
drop policy if exists "OEM owners can view their subscription" on public.subscriptions;
create policy "OEM owners can view their subscription"
  on public.subscriptions for select
  using (public.is_org_member(oem_org_id) or public.is_admin());

drop policy if exists "OEM owners can update their subscription" on public.subscriptions;
create policy "OEM owners can update their subscription"
  on public.subscriptions for update
  using (public.is_org_member(oem_org_id));

-- Inspection bookings policies
drop policy if exists "OEM owners can view their inspection bookings" on public.inspection_bookings;
create policy "OEM owners can view their inspection bookings"
  on public.inspection_bookings for select
  using (public.is_org_member(oem_org_id) or public.is_admin());

drop policy if exists "OEM owners can create inspection bookings" on public.inspection_bookings;
create policy "OEM owners can create inspection bookings"
  on public.inspection_bookings for insert
  with check (public.is_org_member(oem_org_id));

drop policy if exists "Admins can update inspection bookings" on public.inspection_bookings;
create policy "Admins can update inspection bookings"
  on public.inspection_bookings for update
  using (public.is_admin());

-- Analytics events policies (write-only for logging, read for OEM owners with insights access)
drop policy if exists "Anyone can log analytics events" on public.oem_analytics_events;
create policy "Anyone can log analytics events"
  on public.oem_analytics_events for insert
  with check (true);

drop policy if exists "OEM owners with insights can view their analytics" on public.oem_analytics_events;
create policy "OEM owners with insights can view their analytics"
  on public.oem_analytics_events for select
  using (
    public.is_org_member(oem_org_id) and public.oem_has_insights_access(oem_org_id)
  );

-- Keyword traffic policies
drop policy if exists "OEM owners with insights can view their keyword traffic" on public.oem_keyword_traffic;
create policy "OEM owners with insights can view their keyword traffic"
  on public.oem_keyword_traffic for select
  using (
    public.is_org_member(oem_org_id) and public.oem_has_insights_access(oem_org_id)
  );

-- OEM Media policies
drop policy if exists "Public media is readable by all" on public.oem_media;
create policy "Public media is readable by all"
  on public.oem_media for select
  using (true);

drop policy if exists "OEM owners can manage their media" on public.oem_media;
create policy "OEM owners can manage their media"
  on public.oem_media for all
  using (public.is_org_member(oem_org_id));

-- OEM Profile Drafts policies
drop policy if exists "OEM owners can manage their drafts" on public.oem_profile_drafts;
create policy "OEM owners can manage their drafts"
  on public.oem_profile_drafts for all
  using (public.is_org_member(oem_org_id));

-- Saved OEMs policies
drop policy if exists "Users can view their saved OEMs" on public.saved_oems;
create policy "Users can view their saved OEMs"
  on public.saved_oems for select
  using (public.is_org_member(buyer_org_id));

drop policy if exists "Users can manage their saved OEMs" on public.saved_oems;
create policy "Users can manage their saved OEMs"
  on public.saved_oems for all
  using (public.is_org_member(buyer_org_id));

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Add indexes for common queries
create index if not exists oem_profiles_status_idx on public.oem_profiles(profile_status);
create index if not exists oem_profiles_verified_idx on public.oem_profiles(verified_at) where verified_at is not null;

-- ============================================================================
-- DEFAULT DATA
-- ============================================================================

-- Insert default subscription for existing OEMs
insert into public.subscriptions (oem_org_id, tier, status)
select organization_id, 'FREE'::public.subscription_tier, 'ACTIVE'::public.subscription_status
from public.oem_profiles
on conflict (oem_org_id) do nothing;

-- ============================================================================
-- COMMENTS
-- ============================================================================

comment on table public.oem_capabilities is 'OEM factory capabilities and services offered';
comment on table public.product_images is 'Multiple images per product (1-5 images)';
comment on table public.subscriptions is '3-tier subscription system: Free, Insights, Verified Partner';
comment on table public.inspection_bookings is 'Factory inspection scheduling for Verified Partner tier';
comment on table public.oem_analytics_events is 'User interaction events for insights dashboard';
comment on table public.oem_keyword_traffic is 'Search keyword tracking for SEO insights';
comment on table public.oem_media is 'Factory tour and QC process videos (Verified Partner only)';
comment on table public.oem_profile_drafts is 'Auto-saved wizard progress';
comment on table public.saved_oems is 'Buyer bookmark/save OEM profiles';
