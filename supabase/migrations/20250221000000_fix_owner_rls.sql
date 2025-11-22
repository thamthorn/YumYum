-- Fix RLS issues where organization owner is not considered a member

-- 1. Update is_org_member to include owner check
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
    )
    or exists (
      select 1
      from public.organizations o
      where o.id = org_id
        and o.owner_id = auth.uid()
    );
$$;

-- 2. Allow organization owners to insert members (so they can add themselves or others)
drop policy if exists "Org members insertable by owners" on public.organization_members;
create policy "Org members insertable by owners" on public.organization_members
for insert with check (
  public.is_admin() 
  or exists (
    select 1
    from public.organization_members m
    where m.organization_id = organization_members.organization_id
      and m.profile_id = auth.uid()
      and m.role_in_org in ('owner', 'admin')
  )
  or exists (
    select 1
    from public.organizations o
    where o.id = organization_members.organization_id
      and o.owner_id = auth.uid()
  )
);

-- 3. Allow organization owners to delete members
drop policy if exists "Org members deletable by owners" on public.organization_members;
create policy "Org members deletable by owners" on public.organization_members
for delete using (
  public.is_admin() 
  or exists (
    select 1
    from public.organization_members m
    where m.organization_id = organization_members.organization_id
      and m.profile_id = auth.uid()
      and m.role_in_org in ('owner', 'admin')
  )
  or exists (
    select 1
    from public.organizations o
    where o.id = organization_members.organization_id
      and o.owner_id = auth.uid()
  )
);
