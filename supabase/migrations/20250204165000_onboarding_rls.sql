-- Allow authenticated users to create buyer organizations and bootstrap memberships.

create policy "Organizations insert self-owned"
on public.organizations
for insert
with check (
  auth.uid() = owner_id
);

create policy "Org members owner bootstrap"
on public.organization_members
for insert
with check (
  profile_id = auth.uid()
  and role_in_org in ('owner', 'admin')
);
