-- Add helper function to get organization_id from user_id
CREATE OR REPLACE FUNCTION public.get_user_organization_id(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  SELECT id INTO v_org_id
  FROM public.organizations
  WHERE owner_id = p_user_id
  LIMIT 1;
  
  RETURN v_org_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_organization_id(uuid) TO authenticated;

COMMENT ON FUNCTION public.get_user_organization_id IS 'Gets the organization ID for a given user ID (owner_id lookup)';
