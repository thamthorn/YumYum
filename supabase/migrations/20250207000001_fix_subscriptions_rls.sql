-- Fix RLS policy for subscriptions table to allow buyers to see OEM tiers
-- This is required for the search page to display tier badges and apply tier bonuses

-- Drop the restrictive policy
drop policy if exists "OEM owners can view their subscription" on public.subscriptions;

-- Allow OEM owners to view their own subscription (full access)
create policy "OEM owners can view their subscription"
  on public.subscriptions for select
  using (public.is_org_member(oem_org_id) or public.is_admin());

-- Allow everyone (including anonymous users) to view tier information for active OEM profiles
-- This is safe because tier is public information displayed on the platform
create policy "Public can view active OEM subscription tiers"
  on public.subscriptions for select
  using (
    status = 'ACTIVE' 
    and oem_org_id in (
      select organization_id 
      from public.oem_profiles 
      where profile_status = 'ACTIVE'
    )
  );
