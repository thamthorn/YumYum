-- Create reviews table
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  
  -- Who wrote the review
  buyer_org_id uuid not null references public.organizations(id) on delete cascade,
  reviewer_profile_id uuid not null references public.profiles(id) on delete cascade,
  
  -- Which OEM is being reviewed
  oem_org_id uuid not null references public.organizations(id) on delete cascade,
  
  -- Related order (optional, but proves verified purchase)
  order_id uuid references public.orders(id) on delete set null,
  
  -- Overall rating (1-5 stars)
  rating int not null check (rating >= 1 and rating <= 5),
  
  -- Category ratings (optional, 1-5 stars each)
  quality_rating int check (quality_rating is null or (quality_rating >= 1 and quality_rating <= 5)),
  communication_rating int check (communication_rating is null or (communication_rating >= 1 and communication_rating <= 5)),
  delivery_rating int check (delivery_rating is null or (delivery_rating >= 1 and delivery_rating <= 5)),
  service_rating int check (service_rating is null or (service_rating >= 1 and service_rating <= 5)),
  
  -- Review content
  title text,
  review_text text,
  
  -- Metadata
  is_verified boolean default false, -- True if linked to a completed order
  is_visible boolean default true, -- For moderation
  helpful_count int default 0, -- How many found this helpful
  
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Prevent duplicate reviews from same buyer to same OEM
  unique(buyer_org_id, oem_org_id, order_id)
);

-- Create index for faster queries
create index if not exists reviews_oem_org_id_idx on public.reviews(oem_org_id);
create index if not exists reviews_buyer_org_id_idx on public.reviews(buyer_org_id);
create index if not exists reviews_created_at_idx on public.reviews(created_at desc);
create index if not exists reviews_rating_idx on public.reviews(rating);

-- Create table for tracking helpful votes
create table if not exists public.review_helpful_votes (
  review_id uuid not null references public.reviews(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  
  primary key (review_id, profile_id)
);

-- Function to update OEM rating when a review is added/updated/deleted
create or replace function public.update_oem_rating()
returns trigger as $$
begin
  -- Recalculate average rating and total reviews for the OEM
  update public.oem_profiles
  set 
    rating = (
      select round(avg(rating)::numeric, 1)
      from public.reviews
      where oem_org_id = coalesce(new.oem_org_id, old.oem_org_id)
        and is_visible = true
    ),
    total_reviews = (
      select count(*)
      from public.reviews
      where oem_org_id = coalesce(new.oem_org_id, old.oem_org_id)
        and is_visible = true
    )
  where organization_id = coalesce(new.oem_org_id, old.oem_org_id);
  
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

-- Trigger to auto-update OEM rating
drop trigger if exists update_oem_rating_on_review_insert on public.reviews;
create trigger update_oem_rating_on_review_insert
  after insert on public.reviews
  for each row
  execute function public.update_oem_rating();

drop trigger if exists update_oem_rating_on_review_update on public.reviews;
create trigger update_oem_rating_on_review_update
  after update of rating, is_visible on public.reviews
  for each row
  execute function public.update_oem_rating();

drop trigger if exists update_oem_rating_on_review_delete on public.reviews;
create trigger update_oem_rating_on_review_delete
  after delete on public.reviews
  for each row
  execute function public.update_oem_rating();

-- Function to auto-set is_verified based on order status
create or replace function public.set_review_verified()
returns trigger as $$
begin
  if new.order_id is not null then
    new.is_verified := exists (
      select 1 from public.orders
      where id = new.order_id
        and status = 'completed'
    );
  else
    new.is_verified := false;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_review_verified_trigger on public.reviews;
create trigger set_review_verified_trigger
  before insert on public.reviews
  for each row
  execute function public.set_review_verified();

-- RLS Policies
alter table public.reviews enable row level security;
alter table public.review_helpful_votes enable row level security;

-- Anyone can read visible reviews
create policy "Anyone can view visible reviews"
  on public.reviews for select
  using (is_visible = true);

-- Buyers can create reviews for OEMs they've worked with
create policy "Buyers can create reviews"
  on public.reviews for insert
  with check (
    exists (
      select 1 from public.organization_members
      where profile_id = auth.uid()
        and organization_id = buyer_org_id
    )
  );

-- Buyers can update their own reviews
create policy "Buyers can update own reviews"
  on public.reviews for update
  using (
    exists (
      select 1 from public.organization_members
      where profile_id = auth.uid()
        and organization_id = buyer_org_id
    )
  );

-- Buyers can delete their own reviews
create policy "Buyers can delete own reviews"
  on public.reviews for delete
  using (
    exists (
      select 1 from public.organization_members
      where profile_id = auth.uid()
        and organization_id = buyer_org_id
    )
  );

-- Anyone can vote helpful
create policy "Anyone can vote helpful"
  on public.review_helpful_votes for all
  using (auth.uid() = profile_id);

-- Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists reviews_updated_at on public.reviews;
create trigger reviews_updated_at
  before update on public.reviews
  for each row
  execute function public.handle_updated_at();

-- Comments
comment on table public.reviews is 'Buyer reviews of OEM suppliers';
comment on column public.reviews.is_verified is 'True if review is from a buyer with a completed order';
comment on column public.reviews.helpful_count is 'Number of users who found this review helpful';
