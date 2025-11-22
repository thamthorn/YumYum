import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Gets the organization ID and OEM profile ID for the authenticated user
 * Handles the relationship: auth.users -> profiles -> organizations -> oem_profiles
 */
export async function getOEMIds(supabase: SupabaseClient, userId: string) {
  // Get organization owned by this user
  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .select("id")
    .eq("owner_id", userId)
    .single();

  if (orgError || !organization) {
    return { organizationId: null, oemProfileId: null, error: orgError };
  }

  // OEM profile uses organization_id as primary key
  const { data: profile, error: profileError } = await supabase
    .from("oem_profiles")
    .select("organization_id")
    .eq("organization_id", organization.id)
    .single();

  if (profileError || !profile) {
    return {
      organizationId: organization.id,
      oemProfileId: null,
      error: profileError,
    };
  }

  return {
    organizationId: organization.id,
    oemProfileId: profile.organization_id,
    error: null,
  };
}
