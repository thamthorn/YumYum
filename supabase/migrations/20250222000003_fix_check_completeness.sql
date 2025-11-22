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
  v_has_categories_and_moq boolean;
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

  -- Check if has at least 1 category/MOQ set (checking all columns)
  select exists(
    select 1
    from public.oem_profiles
    where organization_id = org_id
    and (
      moq_skincare is not null or
      moq_haircare is not null or
      moq_supplements is not null or
      moq_makeup is not null or
      moq_beverages is not null or
      moq_snacks is not null or
      moq_sauces_condiments is not null or
      moq_bakery is not null or
      moq_dairy_alternatives is not null or
      moq_ready_to_eat is not null or
      moq_desserts is not null or
      moq_health_foods is not null or
      moq_pet_food is not null
    )
  ) into v_has_categories_and_moq;

  return v_has_products and v_has_basic_info and v_has_categories_and_moq;
end;
$$;

-- Auto-fix: Update status to ACTIVE for any profile that is now considered complete
-- This helps users who already submitted but got stuck in INCOMPLETE/REGISTERED
UPDATE public.oem_profiles
SET profile_status = 'ACTIVE'
WHERE public.check_oem_profile_completeness(organization_id) = true
AND profile_status IN ('REGISTERED', 'INCOMPLETE', 'DRAFT');
