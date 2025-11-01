import { createRequest, listRequests } from "@/domain/requests/service";
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

export const GET = withErrorHandling(async (request: Request) => {
  const context = await createSupabaseRouteContext();
  const url = new URL(request.url);
  const requests = await listRequests(url.searchParams, context);

  if (!requests || requests.length === 0) {
    return jsonResponse({ data: [] });
  }

  const { supabase } = context;
  const oemOrgIds = Array.from(
    new Set(
      requests
        .map((request) => request.oem_org_id)
        .filter((value): value is string => Boolean(value))
    )
  );

  if (oemOrgIds.length === 0) {
    return jsonResponse({ data: requests });
  }

  const organizationIdFilter = `(${oemOrgIds
    .map((id) => `"${id}"`)
    .join(",")})`;

  const { data: oemProfiles, error: oemProfileError } = await supabase
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

  if (oemProfileError) {
    return jsonResponse(
      { data: requests, warning: "Unable to load OEM details." },
      200
    );
  }

  const profiles = (oemProfiles ?? []) as unknown as RequestOEMProfile[];

  const profileMap = new Map<string, RequestOEMProfile>();
  profiles.forEach((profile) => {
    profileMap.set(profile.organization_id, profile);
  });

  // Fetch files for all requests
  const requestIds = requests.map((r) => r.id);
  const { data: requestFiles } = await supabase
    .from("request_files")
    .select("id, request_id, path, mime_type, size_bytes")
    .in("request_id", requestIds);

  const filesMap = new Map<string, typeof requestFiles>();
  requestFiles?.forEach((file) => {
    const existing = filesMap.get(file.request_id) ?? [];
    filesMap.set(file.request_id, [...existing, file]);
  });

  const response = requests.map((request) => {
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

export const POST = withErrorHandling(async (request: Request) => {
  const context = await createSupabaseRouteContext();
  const payload = await request.json();
  const created = await createRequest(payload, context);
  return jsonResponse({ data: created }, 201);
});
