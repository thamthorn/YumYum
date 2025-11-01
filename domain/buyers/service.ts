import type { SupabaseRouteContext } from "@/lib/http/route-context";
import { AppError } from "@/utils/errors";
import {
  onboardingInputSchema,
  type BuyerOnboardingResult,
} from "@/domain/buyers/schema";
import type { Database, TablesInsert } from "@/types/database";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { findMatchingOems, saveMatches } from "@/domain/matching/service";

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

export const processBuyerOnboarding = async (
  payload: unknown,
  context: SupabaseRouteContext
): Promise<BuyerOnboardingResult> => {
  const input = onboardingInputSchema.parse(payload);
  const { moqRange, ...rest } = input;
  const { supabase, userId } = context;
  const supabaseAdmin = createSupabaseAdminClient();

  // Determine existing buyer organization for the user
  const { data: membershipData, error: membershipError } = await supabase
    .from("organization_members")
    .select(
      "organization_id, role_in_org, organizations(id, type, display_name, industry, location, slug)"
    )
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
  let isNewOrg = false;

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
    isNewOrg = true;

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

      // Rollback: Delete the organization we just created
      await supabaseAdmin.from("organizations").delete().eq("id", buyerOrgId);

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

  // Wrap profile and preference creation in try-catch for rollback
  try {
    const buyerProfileUpsert: TablesInsert<"buyer_profiles"> = {
      organization_id: buyerOrgId,
      company_name: rest.companyName,
      cross_border: rest.crossBorder,
      prototype_needed: rest.prototypeNeeded,
      notes: rest.productType,
    };

    const { error: profileError } = await supabase
      .from("buyer_profiles")
      .upsert<
        Database["public"]["Tables"]["buyer_profiles"]["Insert"]
      >(buyerProfileUpsert, {
        onConflict: "organization_id",
      });

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
      .upsert<
        Database["public"]["Tables"]["buyer_preferences"]["Insert"]
      >(preferenceUpsert, { onConflict: "organization_id" });

    if (preferenceError) {
      console.error("buyer_preferences_save_failed", preferenceError);
      throw new AppError("Failed to save buyer preferences", {
        cause: preferenceError,
        code: "buyer_preferences_save_failed",
      });
    }
  } catch (error) {
    // Rollback: If this was a new organization and profile/preferences failed, clean up
    if (isNewOrg) {
      console.error(
        "Onboarding failed, rolling back organization creation",
        error
      );

      // Delete organization_members
      await supabaseAdmin
        .from("organization_members")
        .delete()
        .eq("organization_id", buyerOrgId);

      // Delete organization
      await supabaseAdmin.from("organizations").delete().eq("id", buyerOrgId);
    }

    // Re-throw the error
    throw error;
  }

  // Find and score matching OEMs using the matching service
  const matchResults = await findMatchingOems(
    {
      buyerOrgId,
      industry: rest.industry,
      moqMin: moqRange.min,
      moqMax: moqRange.max,
      timeline: rest.timeline,
      location: rest.location,
      crossBorder: rest.crossBorder,
      prototypeNeeded: rest.prototypeNeeded,
      certifications: rest.certifications,
      source: rest.quickMatch ? "quick_match" : "onboarding",
    },
    context,
    10 // Get top 10 matches
  );

  // Save matches to database
  await saveMatches(
    matchResults,
    {
      buyerOrgId,
      industry: rest.industry,
      moqMin: moqRange.min,
      moqMax: moqRange.max,
      timeline: rest.timeline,
      location: rest.location,
      crossBorder: rest.crossBorder,
      prototypeNeeded: rest.prototypeNeeded,
      certifications: rest.certifications,
      source: rest.quickMatch ? "quick_match" : "onboarding",
    },
    context
  );

  return {
    buyerOrgId,
    matches: matchResults.map((match) => ({
      oemOrgId: match.oemOrgId,
      score: match.score,
      name: "OEM", // Will be fetched from database when needed
      slug: null,
      industry: null,
      location: null,
      scale: null,
      moqMin: null,
      moqMax: null,
      rating: null,
      totalReviews: null,
    })),
  };
};
