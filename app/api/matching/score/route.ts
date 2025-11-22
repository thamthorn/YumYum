import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { MATCHING_WEIGHTS } from "@/types/platform";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      requiredCategories = [],
      moqRange = [0, 100000],
      leadTimeRange = [0, 90],
      requiredCertifications = [],
      preferredCapabilities = [],
    } = body;

    // Get all active OEM profiles with related data
    const { data: oems, error } = await supabase
      .from("oem_profiles")
      .select(
        `
        id,
        company_name,
        location,
        description,
        rating,
        review_count,
        products(
          category,
          moq,
          lead_time_days,
          price_range_min
        ),
        oem_certifications(certification_type),
        oem_capabilities(*),
        subscriptions!inner(tier, status)
      `
      )
      .eq("profile_status", "ACTIVE")
      .eq("subscriptions.status", "active");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate match scores
    type MatchResult = {
      oemId: string | number;
      companyName: string;
      location: string | null;
      tier: string;
      matchScore: number;
      matchReasons: string[];
      rating?: number;
      reviewCount?: number;
    };

    const matches: MatchResult[] = (oems || []).map((oem: any): MatchResult => {
      let score = 0;
      const reasons: string[] = [];

      // Category match (40%)
      const categoryMatch = oem.products.some((p: any) =>
        requiredCategories.length === 0
          ? true
          : requiredCategories.includes(p.category)
      );
      if (categoryMatch) {
        score += MATCHING_WEIGHTS.category;
        reasons.push("Category match");
      }

      // MOQ match (25%)
      const moqMatch = oem.products.some(
        (p: any) => p.moq >= moqRange[0] && p.moq <= moqRange[1]
      );
      if (moqMatch) {
        score += MATCHING_WEIGHTS.moq;
        reasons.push("MOQ within range");
      }

      // Lead time match (15%)
      const leadTimeMatch = oem.products.some(
        (p: any) =>
          p.lead_time_days >= leadTimeRange[0] &&
          p.lead_time_days <= leadTimeRange[1]
      );
      if (leadTimeMatch) {
        score += MATCHING_WEIGHTS.leadTime;
        reasons.push("Lead time suitable");
      }

      // Certifications match (10%)
      const certMatch =
        requiredCertifications.length === 0 ||
        requiredCertifications.some((c: string) =>
          oem.oem_certifications.some(
            (cert: any) => cert.certification_type === c
          )
        );
      if (certMatch && requiredCertifications.length > 0) {
        score += MATCHING_WEIGHTS.certifications;
        reasons.push("Has required certifications");
      }

      // Price competitiveness (5%)
      const avgPrice =
        oem.products.reduce(
          (sum: number, p: any) => sum + (p.price_range_min || 0),
          0
        ) / oem.products.length;
      if (avgPrice > 0) {
        score += MATCHING_WEIGHTS.priceRange;
        reasons.push("Competitive pricing");
      }

      // Tier bonus (5%)
      const tier = oem.subscriptions?.[0]?.tier || "FREE";
      const tierBonus = {
        VERIFIED_PARTNER: 5,
        INSIGHTS: 3,
        FREE: 0,
      };
      score += tierBonus[tier as keyof typeof tierBonus];
      if (tier !== "FREE") {
        reasons.push(
          `${tier === "VERIFIED_PARTNER" ? "Verified Partner" : "Insights"} tier`
        );
      }

      // Capabilities bonus (extra points)
      const capabilitiesMap: Record<string, string> = {
        "R&D Support": "has_rd_support",
        "Packaging Design": "has_packaging_design",
        "Formula Library": "has_formula_library",
        "White Label": "has_white_label",
        "Export Support": "has_export_support",
      };

      preferredCapabilities.forEach((cap: string) => {
        const key = capabilitiesMap[cap];
        if (key && oem.oem_capabilities?.[key]) {
          score += 2;
          reasons.push(cap);
        }
      });

      return {
        oemId: oem.id,
        companyName: oem.company_name,
        location: oem.location,
        tier,
        matchScore: Math.min(score, 100),
        matchReasons: reasons,
        rating: oem.rating,
        reviewCount: oem.review_count,
      };
    });

    // Sort by match score descending
    matches.sort(
      (a: MatchResult, b: MatchResult) => b.matchScore - a.matchScore
    );

    // Log search event for analytics
    const topMatch = matches[0];
    if (topMatch) {
      await supabase.rpc("log_analytics_event", {
        p_oem_profile_id: topMatch.oemId,
        p_event_type: "search_appearance",
        p_metadata: {
          position: 1,
          matchScore: topMatch.matchScore,
        },
      } as any);
    }

    return NextResponse.json({
      matches: matches.slice(0, 50), // Return top 50 matches
      totalMatches: matches.length,
    });
  } catch (error) {
    console.error("Matching error:", error);
    return NextResponse.json(
      { error: "Failed to calculate matches" },
      { status: 500 }
    );
  }
}
