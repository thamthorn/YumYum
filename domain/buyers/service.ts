import type { SupabaseRouteContext } from "@/lib/http/route-context";
import { AppError } from "@/utils/errors";
import { onboardingInputSchema, type BuyerOnboardingResult } from "@/domain/buyers/schema";
import type { Database, TablesInsert } from "@/types/database";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const BUYER_MEMBER_ROLE = "owner";

type OrganizationMemberRow = {
  organization_id: string;
  role_in_org: string;
  organizations: {
    id: string;
    type: string;
    display_name: string;
    industry: string | null;
    location: string | null;
    slug: string | null;
  } | null;
};

type MatchingOemRow = Database["public"]["Tables"]["oem_profiles"]["Row"] & {
  organizations: Pick<
    Database["public"]["Tables"]["organizations"]["Row"],
    "id" | "slug" | "display_name" | "industry" | "location"
  > | null;
};

export const processBuyerOnboarding = async (
  payload: unknown,
  context: SupabaseRouteContext
): Promise<BuyerOnboardingResult> => {
  const input = onboardingInputSchema.parse(payload);
  const { moqRange, ...rest } = input;
  const { supabase, session } = context;
  const supabaseAdmin = createSupabaseAdminClient();

  const userId = session.user.id;

  // Determine existing buyer organization for the user
  const { data: membershipData, error: membershipError } = await supabase
    .from("organization_members")
    .select("organization_id, role_in_org, organizations(id, type, display_name, industry, location, slug)")
    .filter("profile_id", "eq", userId)
    .filter("organizations.type", "eq", "buyer")
    .maybeSingle();

  if (membershipError && membershipError.code !== "PGRST116") {
    console.error("buyer_membership_fetch_failed", membershipError);
    throw new AppError("Failed to load existing buyer organization", {
      cause: membershipError,
      code: "buyer_membership_fetch_failed",
    });
  }

  const existingMember = membershipData as OrganizationMemberRow | null;

  let buyerOrgId: string;

  if (!existingMember) {
    const insertOrg: TablesInsert<"organizations"> = {
      type: "buyer",
      display_name: rest.companyName,
      industry: rest.industry,
      location: rest.location,
      description: rest.productType,
      slug: slugify(rest.companyName),
      owner_id: userId,
    };

    const { data: orgRow, error: orgError } = await supabaseAdmin
      .from("organizations")
      .insert(insertOrg)
      .select()
      .single();

    if (orgError || !orgRow) {
      console.error("buyer_org_create_failed", orgError);
      throw new AppError("Failed to create buyer organization", {
        cause: orgError,
        code: "buyer_org_create_failed",
      });
    }

    buyerOrgId = orgRow.id;

    const { error: memberError } = await supabaseAdmin
      .from("organization_members")
      .insert({
        organization_id: buyerOrgId,
        profile_id: userId,
        role_in_org: BUYER_MEMBER_ROLE,
        accepted_at: new Date().toISOString(),
        created_by: userId,
      });

    if (memberError) {
      console.error("buyer_org_membership_failed", memberError);
      throw new AppError("Failed to link buyer organization to user", {
        cause: memberError,
        code: "buyer_org_membership_failed",
      });
    }
  } else {
    buyerOrgId = existingMember.organization_id;

    const { error: updateOrgError } = await supabaseAdmin
      .from("organizations")
      .update({
        display_name: rest.companyName,
        industry: rest.industry,
        location: rest.location,
        description: rest.productType,
        slug: slugify(rest.companyName),
        updated_at: new Date().toISOString(),
      })
      .eq("id", buyerOrgId);

    if (updateOrgError) {
      console.error("buyer_org_update_failed", updateOrgError);
      throw new AppError("Failed to update buyer organization", {
        cause: updateOrgError,
        code: "buyer_org_update_failed",
      });
    }
  }

  const buyerProfileUpsert: TablesInsert<"buyer_profiles"> = {
    organization_id: buyerOrgId,
    company_name: rest.companyName,
    cross_border: rest.crossBorder,
    prototype_needed: rest.prototypeNeeded,
    notes: rest.productType,
  };

  const { error: profileError } = await supabase
    .from("buyer_profiles")
    .upsert<Database["public"]["Tables"]["buyer_profiles"]["Insert"]>(
      buyerProfileUpsert,
      {
        onConflict: "organization_id",
      }
    );

  if (profileError) {
    console.error("buyer_profile_save_failed", profileError);
    throw new AppError("Failed to save buyer profile", {
      cause: profileError,
      code: "buyer_profile_save_failed",
    });
  }

  const preferenceUpsert: TablesInsert<"buyer_preferences"> = {
    organization_id: buyerOrgId,
    product_type: rest.productType,
    moq_min: moqRange.min,
    moq_max: moqRange.max,
    timeline: rest.timeline,
    location_preference: rest.location,
    prototype_needed: rest.prototypeNeeded,
    cross_border: rest.crossBorder,
    metadata: {
      certifications: rest.certifications,
      quickMatch: rest.quickMatch ?? false,
    },
  };

  const { error: preferenceError } = await supabase
    .from("buyer_preferences")
    .upsert<Database["public"]["Tables"]["buyer_preferences"]["Insert"]>(
      preferenceUpsert,
      { onConflict: "organization_id" }
    );

  if (preferenceError) {
    console.error("buyer_preferences_save_failed", preferenceError);
    throw new AppError("Failed to save buyer preferences", {
      cause: preferenceError,
      code: "buyer_preferences_save_failed",
    });
  }

  // Fetch OEMs matching the buyer's selected industry
  const { data: matchingOems, error: matchFetchError } = await supabase
    .from("oem_profiles")
    .select(
      `
        organization_id,
        scale,
        moq_min,
        moq_max,
        rating,
        total_reviews,
        organizations!inner (
          id,
          slug,
          display_name,
          industry,
          location
        )
      `
    )
    .filter("organizations.industry", "eq", rest.industry)
    .limit(20);

  if (matchFetchError) {
    console.error("matching_fetch_failed", matchFetchError);
    throw new AppError("Failed to locate matching OEMs", {
      cause: matchFetchError,
      code: "matching_fetch_failed",
    });
  }

  const oemRows = (matchingOems ?? []) as unknown as MatchingOemRow[];

  console.log(`Matching OEMs for industry "${rest.industry}":`, oemRows.length);

  const upsertMatches: Database["public"]["Tables"]["matches"]["Insert"][] =
    oemRows.map((oem) => ({
      buyer_org_id: buyerOrgId,
      oem_org_id: oem.organization_id,
      status: "new_match",
      score: 100,
      source: rest.quickMatch ? "quick_match" : "onboarding",
      digest: {
        industry: rest.industry,
        moq: moqRange,
        timeline: rest.timeline,
        location: rest.location,
        crossBorderPreference: rest.crossBorder,
      },
    }));

  if (upsertMatches.length > 0) {
    const { error: upsertError } = await supabase
      .from("matches")
      .upsert<Database["public"]["Tables"]["matches"]["Insert"]>(upsertMatches, {
        onConflict: "buyer_org_id,oem_org_id",
      });

    if (upsertError) {
      console.error("matches_upsert_failed", upsertError);
      throw new AppError("Failed to store match results", {
        cause: upsertError,
        code: "matches_upsert_failed",
      });
    }
  }

  const matchesResult = oemRows.map((oem) => ({
    oemOrgId: oem.organization_id,
    name: oem.organizations?.display_name ?? "OEM",
    slug: oem.organizations?.slug ?? null,
    industry: oem.organizations?.industry ?? null,
    location: oem.organizations?.location ?? null,
    scale: oem.scale,
    moqMin: oem.moq_min ?? null,
    moqMax: oem.moq_max ?? null,
    rating: oem.rating ?? null,
    totalReviews: oem.total_reviews ?? null,
  }));

  return {
    buyerOrgId,
    matches: matchesResult,
  };
};
