import type { SupabaseRouteContext } from "@/lib/http/route-context";
import type { Database } from "@/types/database";
import {
  findMatchingOems,
  saveMatches,
  type MatchResult,
} from "@/domain/matching/service";

/**
 * Generate matches when a quote or prototype request is submitted
 */
export async function generateMatchesForRequest(
  requestId: string,
  requestData: {
    buyerOrgId: string;
    oemOrgId?: string; // If specified, only create a match with this OEM
    type: "quote" | "prototype";
    productBrief?: string;
    industry?: string;
    quantityMin?: number;
    quantityMax?: number;
    timeline?: string;
    shippingTerms?: string;
    certifications?: string[];
  },
  context: SupabaseRouteContext
): Promise<void> {
  const { supabase } = context;

  // Get buyer organization industry
  const { data: buyerOrg } = await supabase
    .from("organizations")
    .select("industry")
    .eq("id", requestData.buyerOrgId)
    .single();

  // Get buyer preferences to fill in missing data
  const { data: preferences } = await supabase
    .from("buyer_preferences")
    .select(
      "product_type, location_preference, cross_border, prototype_needed, metadata"
    )
    .eq("organization_id", requestData.buyerOrgId)
    .single();

  // Determine industry from request, buyer org, or default to Other
  const industry = requestData.industry || buyerOrg?.industry || "Other";

  // If a specific OEM is provided, only create a match with that OEM
  let matchResults: MatchResult[];

  if (requestData.oemOrgId) {
    // Get the specific OEM's profile to calculate score
    const { data: oemProfile } = await supabase
      .from("oem_profiles")
      .select(
        `
        organization_id,
        scale,
        moq_min,
        moq_max,
        rating,
        total_reviews,
        cross_border,
        prototype_support,
        organizations!inner (
          id,
          slug,
          display_name,
          industry,
          location
        )
      `
      )
      .eq("organization_id", requestData.oemOrgId)
      .single();

    if (oemProfile) {
      // When requesting from a specific OEM, use THAT OEM's industry for matching
      const oemIndustry =
        (oemProfile as any).organizations?.industry || industry;

      // Calculate score for this specific OEM
      const { calculateMatchScore } = await import("@/domain/matching/service");
      const score = calculateMatchScore(oemProfile as any, {
        buyerOrgId: requestData.buyerOrgId,
        industry: oemIndustry, // Use OEM's industry, not buyer's
        moqMin: requestData.quantityMin,
        moqMax: requestData.quantityMax,
        timeline: requestData.timeline,
        location: preferences?.location_preference || undefined,
        crossBorder: preferences?.cross_border || false,
        prototypeNeeded:
          requestData.type === "prototype" ||
          preferences?.prototype_needed ||
          false,
        certifications: requestData.certifications,
        source:
          requestData.type === "quote" ? "quote_request" : "prototype_request",
        requestId,
      });

      matchResults = [score];
    } else {
      matchResults = [];
    }
  } else {
    // Find matching OEMs based on request criteria
    matchResults = await findMatchingOems(
      {
        buyerOrgId: requestData.buyerOrgId,
        industry,
        moqMin: requestData.quantityMin,
        moqMax: requestData.quantityMax,
        timeline: requestData.timeline,
        location: preferences?.location_preference || undefined,
        crossBorder: preferences?.cross_border || false,
        prototypeNeeded:
          requestData.type === "prototype" ||
          preferences?.prototype_needed ||
          false,
        certifications: requestData.certifications,
        source:
          requestData.type === "quote" ? "quote_request" : "prototype_request",
        requestId,
      },
      context,
      10 // Top 10 matches
    );
  }

  // Save matches
  await saveMatches(
    matchResults,
    {
      buyerOrgId: requestData.buyerOrgId,
      industry,
      moqMin: requestData.quantityMin,
      moqMax: requestData.quantityMax,
      timeline: requestData.timeline,
      location: preferences?.location_preference || undefined,
      crossBorder: preferences?.cross_border || false,
      prototypeNeeded: requestData.type === "prototype",
      certifications: requestData.certifications,
      source:
        requestData.type === "quote" ? "quote_request" : "prototype_request",
      requestId,
    },
    context
  );
}
