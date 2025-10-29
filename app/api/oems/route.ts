import { withErrorHandling } from "@/lib/http/error-handler";
import { jsonResponse } from "@/lib/http/responses";
import { createSupabaseRouteContext } from "@/lib/http/route-context";
import { AppError } from "@/utils/errors";
import type { Database } from "@/types/database";

type OEMProfileRow = Database["public"]["Tables"]["oem_profiles"]["Row"] & {
  organizations: Pick<
    Database["public"]["Tables"]["organizations"]["Row"],
    "id" | "slug" | "display_name" | "industry" | "location"
  > | null;
};

type OEMCertificationRow = {
  oem_org_id: Database["public"]["Tables"]["oem_certifications"]["Row"]["oem_org_id"];
  certifications: { name: string | null } | null;
};

export const GET = withErrorHandling(async (request: Request) => {
  const context = await createSupabaseRouteContext();
  const url = new URL(request.url);

  // Get query parameters for filtering
  const industry = url.searchParams.get("industry");
  const search = url.searchParams.get("search");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const { supabase } = context;

  // Build query
  let query = supabase.from("oem_profiles").select(
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
  );

  // Apply industry filter if provided
  if (industry) {
    query = query.filter("organizations.industry", "eq", industry);
  }

  // Apply search filter if provided (search by OEM name)
  if (search) {
    query = query.ilike("organizations.display_name", `%${search}%`);
  }

  query = query.limit(limit);

  const { data: oemRows, error: oemError } = await query;

  if (oemError) {
    throw new AppError("Failed to load OEM profiles", {
      cause: oemError,
      code: "oem_profiles_failed",
    });
  }

  const oemProfiles = (oemRows ?? []) as unknown as OEMProfileRow[];

  if (oemProfiles.length === 0) {
    return jsonResponse({ data: [] });
  }

  // Get OEM IDs for certifications lookup
  const oemOrgIds = oemProfiles.map((oem) => oem.organization_id);
  const organizationIdFilter = `(${oemOrgIds.map((id) => `"${id}"`).join(",")})`;

  // Fetch certifications
  const { data: certRows, error: certError } = await supabase
    .from("oem_certifications")
    .select("oem_org_id, certifications (name)")
    .filter("oem_org_id", "in", organizationIdFilter);

  // Don't throw error if certifications fail - it's optional data
  if (certError) {
    console.warn("Failed to load OEM certifications:", certError);
  }

  // Map certifications
  const certMap = new Map<string, Array<{ name: string; issuedBy: string }>>();
  const oemCertifications = (certRows ??
    []) as unknown as OEMCertificationRow[];
  oemCertifications.forEach((row) => {
    const name = row.certifications?.name;
    if (!name) return;
    const list = certMap.get(row.oem_org_id) ?? [];
    list.push({ name, issuedBy: "Verified" });
    certMap.set(row.oem_org_id, list);
  });

  // Build response
  const data = oemProfiles.map((oem) => ({
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
  }));

  return jsonResponse({ data });
});
