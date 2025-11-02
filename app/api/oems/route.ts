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
  const productType = url.searchParams.get("productType");
  const minPrice = url.searchParams.get("minPrice");
  const maxPrice = url.searchParams.get("maxPrice");
  const timeline = url.searchParams.get("timeline");

  const { supabase } = context;

  // Convert timeline to max days
  const getMaxDaysFromTimeline = (timeline: string | null): number | null => {
    if (!timeline) return null;
    switch (timeline) {
      case "urgent":
        return 14; // 1-2 weeks
      case "standard":
        return 60; // 1-2 months
      case "flexible":
        return 90; // 3+ months
      default:
        return null;
    }
  };

  const maxLeadTimeDays = getMaxDaysFromTimeline(timeline);

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
        lead_time_days,
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

  let filteredOemProfiles = oemProfiles;

  // Filter by timeline/lead time if provided
  if (maxLeadTimeDays !== null) {
    filteredOemProfiles = filteredOemProfiles.filter((oem) => {
      // Include OEM if their profile lead time meets the deadline
      if (oem.lead_time_days && oem.lead_time_days <= maxLeadTimeDays) {
        return true;
      }
      // We'll also check product lead times below
      return false;
    });
  }

  // Filter by product type, price range, and/or product lead time if provided (Full Match flow)
  if (productType || minPrice || maxPrice || maxLeadTimeDays !== null) {
    const oemOrgIds = oemProfiles.map((oem) => oem.organization_id);

    // Build products query with filters
    let productsQuery = supabase
      .from("products")
      .select(
        "oem_org_id, category, lead_time_days, product_pricing(unit_price)"
      )
      .in("oem_org_id", oemOrgIds)
      .eq("is_active", true);

    if (productType) {
      productsQuery = productsQuery.eq("category", productType);
    }

    const { data: products, error: productsError } = await productsQuery;

    if (!productsError && products) {
      // Filter products by price range and lead time
      const matchingOemIds = new Set<string>();

      products.forEach(
        (product: {
          oem_org_id: string;
          product_pricing: Array<{ unit_price: string | number }>;
          lead_time_days?: number | null;
        }) => {
          let matches = true;

          // Check price range if provided
          if (minPrice || maxPrice) {
            const pricing = product.product_pricing;
            if (!pricing || pricing.length === 0) {
              matches = false;
            } else {
              // Get the minimum price from all pricing tiers
              const productMinPrice = Math.min(
                ...pricing.map((p: { unit_price: string | number }) =>
                  Number(p.unit_price)
                )
              );

              // Check if product's minimum price falls within the range
              const priceMatch =
                (!minPrice || productMinPrice >= Number(minPrice)) &&
                (!maxPrice || productMinPrice <= Number(maxPrice));

              if (!priceMatch) {
                matches = false;
              }
            }
          }

          // Check lead time if provided
          if (maxLeadTimeDays !== null && matches) {
            if (
              !product.lead_time_days ||
              product.lead_time_days > maxLeadTimeDays
            ) {
              matches = false;
            }
          }

          if (matches) {
            matchingOemIds.add(product.oem_org_id);
          }
        }
      );

      // Combine: Include OEM if EITHER profile lead time OR at least one product meets criteria
      if (maxLeadTimeDays !== null) {
        // Already filtered by profile lead time above, now add OEMs with matching products
        const oemsWithMatchingProducts = oemProfiles.filter((oem) =>
          matchingOemIds.has(oem.organization_id)
        );

        // Merge: OEMs from profile filter + OEMs from product filter (remove duplicates)
        const combinedOemIds = new Set([
          ...filteredOemProfiles.map((oem) => oem.organization_id),
          ...oemsWithMatchingProducts.map((oem) => oem.organization_id),
        ]);

        filteredOemProfiles = oemProfiles.filter((oem) =>
          combinedOemIds.has(oem.organization_id)
        );
      } else {
        // No timeline filter, just filter by matching products
        filteredOemProfiles = oemProfiles.filter((oem) =>
          matchingOemIds.has(oem.organization_id)
        );
      }
    }
  }

  // Get OEM IDs for certifications lookup
  const oemOrgIds = filteredOemProfiles.map((oem) => oem.organization_id);

  if (oemOrgIds.length === 0) {
    return jsonResponse({ data: [] });
  }

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

  // Fetch services for each OEM
  const { data: serviceRows, error: serviceError } = await supabase
    .from("oem_services")
    .select("oem_org_id, services (name)")
    .filter("oem_org_id", "in", organizationIdFilter);

  // Don't throw error if services fail - it's optional data
  if (serviceError) {
    console.warn("Failed to load OEM services:", serviceError);
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

  // Map services
  const serviceMap = new Map<string, Array<{ name: string }>>();
  const oemServices = (serviceRows ?? []) as Array<{
    oem_org_id: string;
    services: { name: string } | null;
  }>;
  oemServices.forEach((row) => {
    const name = row.services?.name;
    if (!name) return;
    const list = serviceMap.get(row.oem_org_id) ?? [];
    list.push({ name });
    serviceMap.set(row.oem_org_id, list);
  });

  // Build response
  const data = filteredOemProfiles.map((oem) => ({
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
    leadTimeDays: oem.lead_time_days,
    certifications: certMap.get(oem.organization_id) ?? [],
    services: serviceMap.get(oem.organization_id) ?? [],
  }));

  return jsonResponse({ data });
});
