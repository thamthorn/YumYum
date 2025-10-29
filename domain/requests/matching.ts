import type { SupabaseRouteContext } from "@/lib/http/route-context";
import type { Database } from "@/types/database";
import { findMatchingOems, saveMatches } from "@/domain/matching/service";

/**
 * Generate matches when a quote or prototype request is submitted
 */
export async function generateMatchesForRequest(
  requestId: string,
  requestData: {
    buyerOrgId: string;
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

  // Get buyer preferences to fill in missing data
  const { data: preferences } = await supabase
    .from("buyer_preferences")
    .select(
      "product_type, location_preference, cross_border, prototype_needed, metadata"
    )
    .eq("organization_id", requestData.buyerOrgId)
    .single();

  // Determine industry from request or preferences
  const industry = requestData.industry || preferences?.product_type || "Other";

  // Find matching OEMs based on request criteria
  const matchResults = await findMatchingOems(
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

  console.log(
    `Generated ${matchResults.length} matches for ${requestData.type} request ${requestId}`
  );
}
