-- Allow public read access to OEM catalog data while keeping write operations restricted.

create policy "OEM organizations readable publicly"
on public.organizations
for select
using (type = 'oem');

create policy "OEM profiles readable publicly"
on public.oem_profiles
for select
using (
  exists (
    select 1
    from public.organizations o
    where o.id = oem_profiles.organization_id
      and o.type = 'oem'
  )
);

create policy "OEM services readable publicly"
on public.oem_services
for select
using (
  exists (
    select 1
    from public.organizations o
    where o.id = oem_services.oem_org_id
      and o.type = 'oem'
  )
);

create policy "OEM certifications readable publicly"
on public.oem_certifications
for select
using (
  exists (
    select 1
    from public.organizations o
    where o.id = oem_certifications.oem_org_id
      and o.type = 'oem'
  )
);

create policy "OEM languages readable publicly"
on public.oem_languages
for select
using (
  exists (
    select 1
    from public.organizations o
    where o.id = oem_languages.oem_org_id
      and o.type = 'oem'
  )
);

create policy "OEM previous products readable publicly"
on public.oem_previous_products
for select
using (
  exists (
    select 1
    from public.organizations o
    where o.id = oem_previous_products.oem_org_id
      and o.type = 'oem'
  )
);
