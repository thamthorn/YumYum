-- Add INSERT policy for subscriptions table
-- This allows OEM owners to create new subscriptions

-- Drop existing policy if it exists
drop policy if exists "OEM owners can create their subscription" on public.subscriptions;

-- Allow OEM owners to insert subscriptions for their organization
create policy "OEM owners can create their subscription"
  on public.subscriptions for insert
  with check (public.is_org_member(oem_org_id));

