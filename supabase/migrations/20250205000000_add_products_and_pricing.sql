-- Add products and pricing tables
-- Migration: 20250205000000_add_products_and_pricing

-- Products table - one OEM can have many products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  oem_org_id uuid not null references public.oem_profiles(organization_id) on delete cascade,
  name text not null,
  description text,
  category text,
  sku text,
  image_url text,
  specifications jsonb, -- Store technical specs as JSON
  lead_time_days integer,
  moq integer, -- Minimum Order Quantity for this specific product
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index products_oem_org_idx on public.products (oem_org_id);
create index products_category_idx on public.products (category);
create index products_is_active_idx on public.products (is_active);

create trigger products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

-- Product pricing tiers table - one product can have many pricing tiers (economy of scale)
create table public.product_pricing (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  min_quantity integer not null, -- Minimum quantity for this price tier
  max_quantity integer, -- Maximum quantity (null means unlimited)
  unit_price numeric(10, 2) not null, -- Price per unit in this tier
  currency text not null default 'USD',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  
  -- Ensure quantity ranges don't overlap
  constraint valid_quantity_range check (max_quantity is null or max_quantity >= min_quantity),
  constraint positive_price check (unit_price > 0),
  constraint positive_min_quantity check (min_quantity > 0)
);

create index product_pricing_product_idx on public.product_pricing (product_id);
create index product_pricing_quantity_idx on public.product_pricing (min_quantity, max_quantity);

create trigger product_pricing_updated_at
before update on public.product_pricing
for each row
execute function public.set_updated_at();

-- Product images table (optional - for multiple product images)
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  display_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index product_images_product_idx on public.product_images (product_id);
create index product_images_display_order_idx on public.product_images (product_id, display_order);

-- Enable RLS
alter table public.products enable row level security;
alter table public.product_pricing enable row level security;
alter table public.product_images enable row level security;

-- RLS Policies for Products
-- Public can view active products
create policy "Active products are viewable by everyone"
on public.products
for select
using (is_active = true);

-- OEM members can manage their own products
create policy "OEM members can manage their products"
on public.products
for all
using (public.is_org_member(oem_org_id))
with check (public.is_org_member(oem_org_id));

-- RLS Policies for Product Pricing
-- Public can view pricing for active products
create policy "Pricing for active products is viewable by everyone"
on public.product_pricing
for select
using (
  exists (
    select 1 from public.products p
    where p.id = product_pricing.product_id
    and p.is_active = true
  )
);

-- OEM members can manage their product pricing
create policy "OEM members can manage their product pricing"
on public.product_pricing
for all
using (
  public.is_org_member(
    (select p.oem_org_id from public.products p where p.id = product_pricing.product_id)
  )
)
with check (
  public.is_org_member(
    (select p.oem_org_id from public.products p where p.id = product_pricing.product_id)
  )
);

-- RLS Policies for Product Images
-- Public can view images for active products
create policy "Images for active products are viewable by everyone"
on public.product_images
for select
using (
  exists (
    select 1 from public.products p
    where p.id = product_images.product_id
    and p.is_active = true
  )
);

-- OEM members can manage their product images
create policy "OEM members can manage their product images"
on public.product_images
for all
using (
  public.is_org_member(
    (select p.oem_org_id from public.products p where p.id = product_images.product_id)
  )
)
with check (
  public.is_org_member(
    (select p.oem_org_id from public.products p where p.id = product_images.product_id)
  )
);

-- Helper function to get price for a specific quantity
create or replace function public.get_product_price(
  p_product_id uuid,
  p_quantity integer
)
returns numeric
language sql
stable
as $$
  select unit_price
  from public.product_pricing
  where product_id = p_product_id
    and min_quantity <= p_quantity
    and (max_quantity is null or max_quantity >= p_quantity)
  order by min_quantity desc
  limit 1;
$$;

-- Helper function to get all pricing tiers for a product
create or replace function public.get_product_pricing_tiers(p_product_id uuid)
returns table (
  tier_id uuid,
  min_quantity integer,
  max_quantity integer,
  unit_price numeric,
  currency text
)
language sql
stable
as $$
  select
    id,
    min_quantity,
    max_quantity,
    unit_price,
    currency
  from public.product_pricing
  where product_id = p_product_id
  order by min_quantity asc;
$$;
