create or replace function public.calculate_oem_profile_completeness(org_id uuid)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_score integer := 0;
  v_has_products boolean;
  v_has_product_images boolean;
  v_has_basic_info boolean;
  v_has_categories_and_moq boolean;
  v_has_capabilities boolean;
  v_has_certifications boolean;
begin
  -- Check if has at least 1 product (20 points)
  select exists(
    select 1
    from public.products p
    where p.oem_org_id = org_id
  ) into v_has_products;
  
  if v_has_products then
    v_score := v_score + 20;
    
    -- Check if has product images (10 points)
    select exists(
      select 1
      from public.products p
      where p.oem_org_id = org_id
      and exists(
        select 1 from public.product_images pi where pi.product_id = p.id
      )
    ) into v_has_product_images;
    
    if v_has_product_images then
      v_score := v_score + 10;
    end if;
  end if;

  -- Check basic company info (20 points)
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
  
  if v_has_basic_info then
    v_score := v_score + 20;
  end if;

  -- Check if has at least 1 category/MOQ set (30 points - combined from previous category + moq)
  -- We check all moq columns including the new food ones
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
  
  if v_has_categories_and_moq then
    v_score := v_score + 30;
  end if;

  -- Check if has capabilities (10 points)
  select exists(
    select 1
    from public.oem_capabilities
    where oem_org_id = org_id
  ) into v_has_capabilities;
  
  if v_has_capabilities then
    v_score := v_score + 10;
  end if;

  -- Check if has certifications (10 points)
  select exists(
    select 1
    from public.oem_certifications
    where oem_org_id = org_id
  ) into v_has_certifications;
  
  if v_has_certifications then
    v_score := v_score + 10;
  end if;

  return v_score;
end;
$$;
