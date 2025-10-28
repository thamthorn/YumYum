import { withErrorHandling } from "@/lib/http/error-handler";
import { jsonResponse } from "@/lib/http/responses";
import { createSupabaseRouteContext } from "@/lib/http/route-context";
import { AppError } from "@/utils/errors";
import type { Database } from "@/types/database";

type MatchSummaryRow = Pick<
  Database["public"]["Tables"]["matches"]["Row"],
  "id" | "oem_org_id" | "status" | "score" | "created_at"
>;

type MatchOEMProfileRow = Database["public"]["Tables"]["oem_profiles"]["Row"] & {
  organizations: Pick<
    Database["public"]["Tables"]["organizations"]["Row"],
    "id" | "slug" | "display_name" | "industry" | "location"
  > | null;
};

type MatchCertificationRow = {
  oem_org_id: Database["public"]["Tables"]["oem_certifications"]["Row"]["oem_org_id"];
  certifications: { name: string | null } | null;
};

export const GET = withErrorHandling(async (request: Request) => {
  const context = await createSupabaseRouteContext();
  const url = new URL(request.url);
  const requestedOrgId = url.searchParams.get("buyerOrgId");

  let buyerOrgId = requestedOrgId;

  if (buyerOrgId) {
    context.authorizer.ensureMembership(buyerOrgId);
  } else {
    const buyerMembership = context.authorizer
      .listMemberships()
      .find((member) => member.organizationType === "buyer");
    if (!buyerMembership) {
      throw new AppError("No buyer organization associated with this account", {
        status: 404,
        code: "buyer_org_not_found",
      });
    }
    buyerOrgId = buyerMembership.organizationId;
  }

  const { supabase } = context;

  if (!buyerOrgId) {
    throw new AppError("Unable to determine buyer organization", {
      status: 400,
      code: "buyer_org_missing",
    });
  }

  const buyerOrgIdFilter: Database["public"]["Tables"]["matches"]["Row"]["buyer_org_id"] =
    buyerOrgId;

  const { data: matchRows, error: matchError } = await supabase
    .from("matches")
    .select("id, oem_org_id, status, score, created_at")
    .filter("buyer_org_id", "eq", buyerOrgIdFilter)
    .order("created_at", { ascending: false });

  if (matchError) {
    throw new AppError("Failed to fetch matches", {
      cause: matchError,
      code: "matches_fetch_failed",
    });
  }

  const matchList = (matchRows ?? []) as MatchSummaryRow[];

  if (matchList.length === 0) {
    return jsonResponse({ data: [] });
  }

  const rawOrgIds = Array.from(
    new Set(matchList.map((row) => row.oem_org_id))
  );

  if (rawOrgIds.length === 0) {
    return jsonResponse({ data: [] });
  }

  const organizationIdFilter = `(${rawOrgIds
    .map((id) => `"${id}"`)
    .join(",")})`;

  const { data: oemRows, error: oemError } = await supabase
    .from("oem_profiles")
    .select(
      `
        organization_id,
        scale,
        moq_min,
        moq_max,
        cross_border,
        prototype_support,
        rating,
        total_reviews,
        organizations (
          id,
          slug,
          display_name,
          industry,
          location
        )
      `
    )
    .filter("organization_id", "in", organizationIdFilter);

  if (oemError) {
    throw new AppError("Failed to load OEM profiles for matches", {
      cause: oemError,
      code: "match_oem_profiles_failed",
    });
  }

  const { data: certRows, error: certError } = await supabase
    .from("oem_certifications")
    .select("oem_org_id, certifications (name)")
    .filter("oem_org_id", "in", organizationIdFilter);

  if (certError) {
    throw new AppError("Failed to load OEM certifications", {
      cause: certError,
      code: "match_oem_certifications_failed",
    });
  }

  const oemProfiles = (oemRows ?? []) as unknown as MatchOEMProfileRow[];

  const oemMap = new Map<string, MatchOEMProfileRow>();
  oemProfiles.forEach((row) => {
    oemMap.set(row.organization_id, row);
  });

  const certMap = new Map<string, string[]>();
  const oemCertifications = (certRows ?? []) as unknown as MatchCertificationRow[];
  oemCertifications.forEach((row) => {
    const name = row.certifications?.name;
    if (!name) return;
    const list = certMap.get(row.oem_org_id) ?? [];
    list.push(name);
    certMap.set(row.oem_org_id, list);
  });

  const data = matchList.map((match) => {
    const oem = oemMap.get(match.oem_org_id);
    return {
      id: match.id,
      status: match.status,
      score: match.score,
      createdAt: match.created_at,
      oem: oem
        ? {
            organizationId: oem.organization_id,
            name: oem.organizations?.display_name ?? "OEM",
            slug: oem.organizations?.slug ?? null,
            industry: oem.organizations?.industry ?? null,
            location: oem.organizations?.location ?? null,
            scale: oem.scale,
            moqMin: oem.moq_min,
            moqMax: oem.moq_max,
            crossBorder: oem.cross_border,
            prototypeSupport: oem.prototype_support,
            rating: oem.rating,
            totalReviews: oem.total_reviews,
            certifications: certMap.get(oem.organization_id) ?? [],
          }
        : null,
    };
  });

  return jsonResponse({ data });
});
