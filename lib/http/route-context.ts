import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseRouteClient } from "@/lib/supabase/route-handler";
import { AppError, AuthError } from "@/utils/errors";
import { Authorizer, type Membership } from "@/lib/auth/authorizer";
import type { Database } from "@/types/database";

type AccountRole = Database["public"]["Enums"]["account_role"];
type OrganizationType = Database["public"]["Enums"]["organization_type"];
type RouteSupabaseClient = SupabaseClient<Database>;

const fetchMemberships = async (
  supabase: RouteSupabaseClient,
  profileId: string
): Promise<Membership[]> => {
  const { data, error } = await supabase
    .from("organization_members")
    .select("organization_id, role_in_org, organizations(type)")
    .eq("profile_id", profileId);

  if (error) {
    throw new AppError("Failed to load organization memberships", {
      cause: error,
      code: "membership_fetch_failed",
    });
  }

  const rows = (data ?? []) as unknown as Array<{
    organization_id: string;
    role_in_org: string;
    organizations: { type: OrganizationType } | null;
  }>;

  return rows.map((row) => ({
    organizationId: row.organization_id,
    organizationType: row.organizations?.type ?? null,
    roleInOrg: row.role_in_org,
  }));
};

const fetchProfileRole = async (
  supabase: RouteSupabaseClient,
  profileId: string
): Promise<AccountRole> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", profileId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 -> row not found; fall back to buyer.
    throw new AppError("Failed to load profile", {
      cause: error,
      code: "profile_fetch_failed",
    });
  }

  return (data?.role ?? "buyer") as AccountRole;
};

export interface SupabaseRouteContext {
  supabase: RouteSupabaseClient;
  session: Session;
  authorizer: Authorizer;
  role: AccountRole;
}

export const createSupabaseRouteContext =
  async (): Promise<SupabaseRouteContext> => {
    const rawSupabase = await createSupabaseRouteClient();
    const supabase = rawSupabase as unknown as RouteSupabaseClient;

    // Use getUser() for secure authentication (validates with Supabase Auth server)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw new AppError("Failed to authenticate user", {
        cause: userError,
        code: "user_auth_failed",
      });
    }

    if (!user) {
      throw new AuthError();
    }

    // Get session for compatibility (but user is already authenticated above)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new AuthError();
    }

    const profileId = user.id;
    const [role, memberships] = await Promise.all([
      fetchProfileRole(supabase, profileId),
      fetchMemberships(supabase, profileId),
    ]);

    const authorizer = new Authorizer({
      userId: profileId,
      role,
      memberships,
    });

    return {
      supabase,
      session,
      authorizer,
      role,
    };
  };
