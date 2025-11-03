import { withErrorHandling } from "@/lib/http/error-handler";
import { createSupabaseRouteContext } from "@/lib/http/route-context";
import { jsonResponse } from "@/lib/http/responses";
import type { Database } from "@/types/database";

type RequestOEMProfile = Database["public"]["Tables"]["oem_profiles"]["Row"] & {
  organizations: Pick<
    Database["public"]["Tables"]["organizations"]["Row"],
    "id" | "slug" | "display_name" | "industry" | "location"
  > | null;
};

/**
 * GET /api/admin-create-order/requests
 * Returns only requests that have at least one APPROVED match
 * (match status = 'contacted', 'in_discussion', or 'quote_requested')
 */
export const GET = withErrorHandling(async (request: Request) => {
  const context = await createSupabaseRouteContext();
  const { supabase } = context;

  // Get all matches with approved status (contacted, in_discussion, quote_requested)
  const { data: approvedMatches, error: matchesError } = await supabase
    .from("matches")
    .select("buyer_org_id, oem_org_id, status")
    .in("status", ["contacted", "in_discussion", "quote_requested"]);

  if (matchesError) {
    throw matchesError;
  }

  if (!approvedMatches || approvedMatches.length === 0) {
    return jsonResponse({ data: [] });
  }

  // Create a set of approved buyer-OEM pairs
  const approvedPairs = new Set(
    approvedMatches.map((m) => `${m.buyer_org_id}||${m.oem_org_id}`)
  );

  // Get all requests
  const { data: requestsData, error: requestsError } = await supabase
    .from("requests")
    .select(
      `
      id,
      buyer_org_id,
      oem_org_id,
      type,
      status,
      title,
      product_brief,
      quantity_min,
      quantity_max,
      unit,
      timeline,
      shipping_terms,
      payment_terms,
      add_escrow,
      add_audit,
      submitted_at,
      created_at
    `
    )
    .order("created_at", { ascending: false });

  if (requestsError) {
    throw requestsError;
  }

  if (!requestsData || requestsData.length === 0) {
    return jsonResponse({ data: [] });
  }

  // Filter requests to only include those with approved matches
  const approvedRequests = requestsData.filter((request) => {
    const pairKey = `${request.buyer_org_id}||${request.oem_org_id}`;
    return approvedPairs.has(pairKey);
  });

  if (approvedRequests.length === 0) {
    return jsonResponse({ data: [] });
  }

  // Get OEM profiles for the approved requests
  const oemOrgIds = Array.from(
    new Set(
      approvedRequests
        .map((request) => request.oem_org_id)
        .filter((value): value is string => Boolean(value))
    )
  );

  let profileMap = new Map<string, RequestOEMProfile>();

  if (oemOrgIds.length > 0) {
    const organizationIdFilter = `(${oemOrgIds
      .map((id) => `"${id}"`)
      .join(",")})`;

    const { data: oemProfiles } = await supabase
      .from("oem_profiles")
      .select(
        `
        organization_id,
        scale,
        moq_min,
        moq_max,
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

    const profiles = (oemProfiles ?? []) as unknown as RequestOEMProfile[];
    profiles.forEach((profile) => {
      profileMap.set(profile.organization_id, profile);
    });
  }

  // Fetch files for all approved requests
  const approvedRequestIds = approvedRequests.map((r) => r.id);
  const { data: requestFiles } = await supabase
    .from("request_files")
    .select("id, request_id, path, mime_type, size_bytes")
    .in("request_id", approvedRequestIds);

  const filesMap = new Map<string, typeof requestFiles>();
  requestFiles?.forEach((file) => {
    const existing = filesMap.get(file.request_id) ?? [];
    filesMap.set(file.request_id, [...existing, file]);
  });

  // Format response
  const response = approvedRequests.map((request) => {
    const profile = profileMap.get(request.oem_org_id ?? "");
    const files = filesMap.get(request.id) ?? [];

    return {
      id: request.id,
      status: request.status,
      type: request.type,
      title: request.title,
      productBrief: request.product_brief,
      quantityMin: request.quantity_min,
      quantityMax: request.quantity_max,
      unit: request.unit,
      timeline: request.timeline,
      shippingTerms: request.shipping_terms,
      paymentTerms: request.payment_terms,
      addEscrow: request.add_escrow,
      addAudit: request.add_audit,
      submittedAt: request.submitted_at,
      createdAt: request.created_at,
      buyerOrgId: request.buyer_org_id,
      oemOrgId: request.oem_org_id,
      files: files.map((f) => ({
        id: f.id,
        path: f.path,
        mimeType: f.mime_type,
        sizeBytes: f.size_bytes,
      })),
      oem: profile
        ? {
            id: profile.organizations?.id ?? profile.organization_id,
            name: profile.organizations?.display_name ?? "OEM",
            slug: profile.organizations?.slug ?? null,
            industry: profile.organizations?.industry ?? null,
            location: profile.organizations?.location ?? null,
            scale: profile.scale,
            moqMin: profile.moq_min,
            moqMax: profile.moq_max,
            rating: profile.rating,
            totalReviews: profile.total_reviews,
          }
        : null,
    };
  });

  return jsonResponse({ data: response });
});
