import type { SupabaseRouteContext } from "@/lib/http/route-context";
import type { Database } from "@/types/database";
import { AppError } from "@/utils/errors";

type MatchingOemRow = Database["public"]["Tables"]["oem_profiles"]["Row"] & {
  organizations: Pick<
    Database["public"]["Tables"]["organizations"]["Row"],
    "id" | "slug" | "display_name" | "industry" | "location"
  > | null;
};

export type MatchCriteria = {
  buyerOrgId: string;
  industry: string;
  moqMin?: number;
  moqMax?: number;
  timeline?: string;
  location?: string;
  crossBorder?: boolean;
  prototypeNeeded?: boolean;
  certifications?: string[];
  source: "onboarding" | "quick_match" | "quote_request" | "prototype_request";
  requestId?: string;
};

export type MatchResult = {
  oemOrgId: string;
  score: number;
  reasons: string[];
};

/**
 * Calculate match score and generate reasons for a single OEM
 */
export function calculateMatchScore(
  oem: MatchingOemRow,
  criteria: MatchCriteria
): MatchResult {
  let score = 0;
  const reasons: string[] = [];

  // 1. Industry match (40 points - base requirement)
  // Validate that OEM's industry actually matches criteria
  const oemIndustry = oem.organizations?.industry?.toLowerCase() || "";
  const criteriaIndustry = criteria.industry.toLowerCase();

  if (oemIndustry === criteriaIndustry) {
    score += 40;
    reasons.push(`Industry expertise in ${criteria.industry}`);
  } else {
    // Industry mismatch - this should rarely happen if query filtering works correctly
    // but we validate here to make the function self-contained
    score += 0;
    reasons.push(
      `Industry mismatch: OEM specializes in ${oem.organizations?.industry || "unknown"}, not ${criteria.industry}`
    );
    // Log warning for debugging - this suggests query filter might be broken
    console.warn("calculateMatchScore called with non-matching industry", {
      oemId: oem.organization_id,
      oemIndustry: oem.organizations?.industry,
      criteriaIndustry: criteria.industry,
    });
  }

  // 2. MOQ compatibility (25 points)
  if (criteria.moqMin !== undefined && criteria.moqMax !== undefined) {
    const oemMoqMin = oem.moq_min ?? 0;
    const oemMoqMax = oem.moq_max ?? null;

    // Perfect overlap between buyer and OEM MOQ ranges
    if (
      oemMoqMax !== null &&
      criteria.moqMax >= oemMoqMin &&
      criteria.moqMin <= oemMoqMax
    ) {
      score += 25;
      reasons.push(
        `MOQ range compatible (${oemMoqMin.toLocaleString()}-${oemMoqMax.toLocaleString()} units)`
      );
    }
    // Partial compatibility: OEM has no max limit and buyer meets minimum
    else if (oemMoqMax === null && criteria.moqMin >= oemMoqMin) {
      score += 20;
      reasons.push(
        `Can handle quantities starting from ${criteria.moqMin.toLocaleString()} units`
      );
    }
    // Buyer's order is too small for OEM
    else if (criteria.moqMax < oemMoqMin) {
      score += 0;
      reasons.push(
        `Order size too small (max ${criteria.moqMax.toLocaleString()}) for their minimum (${oemMoqMin.toLocaleString()})`
      );
    }
    // Buyer's order is too large for OEM's capacity
    else if (oemMoqMax !== null && criteria.moqMin > oemMoqMax) {
      score += 0;
      reasons.push(
        `Order size too large (min ${criteria.moqMin.toLocaleString()}) for their capacity (max ${oemMoqMax.toLocaleString()})`
      );
    }
  }

  // 3. Location match (15 points)
  if (criteria.location && oem.organizations?.location) {
    const buyerLocation = criteria.location.toLowerCase();
    const oemLocation = oem.organizations.location.toLowerCase();

    if (
      oemLocation.includes(buyerLocation) ||
      buyerLocation.includes(oemLocation)
    ) {
      score += 15;
      reasons.push(`Located in ${oem.organizations.location}`);
    } else if (
      buyerLocation.includes("thailand") &&
      oemLocation.includes("thailand")
    ) {
      score += 10;
      reasons.push(`Domestic manufacturer in Thailand`);
    }
  }

  // 4. Scale compatibility (10 points)
  if (oem.scale) {
    score += 10;
    const scaleLabel =
      oem.scale === "large"
        ? "Large"
        : oem.scale === "small"
          ? "Small"
          : "Medium";
    reasons.push(`${scaleLabel}-scale manufacturer with proven capacity`);
  }

  // 5. Cross-border capability (10 points)
  if (criteria.crossBorder && oem.cross_border) {
    score += 10;
    reasons.push(`Supports international shipping`);
  }

  // 6. Prototype support (10 points)
  if (criteria.prototypeNeeded && oem.prototype_support) {
    score += 10;
    reasons.push(`Offers prototype development services`);
  }

  // 7. Rating bonus (10 points)
  if (oem.rating && oem.rating >= 4.5) {
    score += 10;
    reasons.push(
      `Highly rated (${oem.rating}⭐ from ${oem.total_reviews || 0} reviews)`
    );
  } else if (oem.rating && oem.rating >= 4.0) {
    score += 5;
    reasons.push(`Good ratings (${oem.rating}⭐)`);
  }

  // Ensure score doesn't exceed 100
  score = Math.min(100, score);

  return {
    oemOrgId: oem.organization_id,
    score,
    reasons,
  };
}

/**
 * Find and score matching OEMs based on criteria
 */
export async function findMatchingOems(
  criteria: MatchCriteria,
  context: SupabaseRouteContext,
  limit: number = 20
): Promise<MatchResult[]> {
  const { supabase } = context;

  // Fetch OEMs matching the buyer's selected industry with additional scoring data
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
    .filter("organizations.industry", "eq", criteria.industry)
    .limit(limit);

  if (matchFetchError) {
    console.error("matching_fetch_failed", matchFetchError);
    throw new AppError("Failed to locate matching OEMs", {
      cause: matchFetchError,
      code: "matching_fetch_failed",
    });
  }

  const oemRows = (matchingOems ?? []) as unknown as MatchingOemRow[];

  console.log(
    `Found ${oemRows.length} OEMs for industry "${criteria.industry}"`
  );

  // Calculate match scores
  const scoredMatches = oemRows.map((oem) =>
    calculateMatchScore(oem, criteria)
  );

  // Sort by score descending
  return scoredMatches.sort((a, b) => b.score - a.score);
}

/**
 * Save or update matches in the database
 */
export async function saveMatches(
  matches: MatchResult[],
  criteria: MatchCriteria,
  context: SupabaseRouteContext
): Promise<void> {
  const { supabase } = context;

  const upsertMatches: Database["public"]["Tables"]["matches"]["Insert"][] =
    matches.map((match) => ({
      buyer_org_id: criteria.buyerOrgId,
      oem_org_id: match.oemOrgId,
      status: "new_match",
      score: match.score,
      source: criteria.source,
      digest: {
        reasons: match.reasons,
        buyerRequirements: {
          industry: criteria.industry,
          moq:
            criteria.moqMin && criteria.moqMax
              ? { min: criteria.moqMin, max: criteria.moqMax }
              : undefined,
          timeline: criteria.timeline,
          location: criteria.location,
          crossBorderPreference: criteria.crossBorder,
          prototypeNeeded: criteria.prototypeNeeded,
          certifications: criteria.certifications,
        },
        requestId: criteria.requestId,
      },
    }));

  if (upsertMatches.length > 0) {
    const { error: upsertError } = await supabase
      .from("matches")
      .upsert<
        Database["public"]["Tables"]["matches"]["Insert"]
      >(upsertMatches, {
        onConflict: "buyer_org_id,oem_org_id",
        // Update existing matches with new scores if better
      });

    if (upsertError) {
      console.error("matches_upsert_failed", upsertError);
      throw new AppError("Failed to store match results", {
        cause: upsertError,
        code: "matches_upsert_failed",
      });
    }

    console.log(
      `Saved ${upsertMatches.length} matches for ${criteria.source}`,
      matches.map((m) => ({ oem: m.oemOrgId, score: m.score }))
    );
  }
}
