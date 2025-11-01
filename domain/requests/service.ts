import type { SupabaseRouteContext } from "@/lib/http/route-context";
import { AppError, ValidationError } from "@/utils/errors";
import {
  createRequestSchema,
  parseListRequestsParams,
} from "@/domain/requests/schema";
import * as repo from "@/domain/requests/repo";
import { generateMatchesForRequest } from "@/domain/requests/matching";

type RequestServiceContext = Pick<
  SupabaseRouteContext,
  "supabase" | "userId" | "authorizer"
>;

export const createRequest = async (
  payload: unknown,
  context: RequestServiceContext
) => {
  const parsed = createRequestSchema.safeParse(payload);
  if (!parsed.success) {
    console.error("request_validation_failed", parsed.error.issues);
    throw new ValidationError(parsed.error.issues);
  }
  const input = parsed.data;

  let buyerOrgId = input.buyerOrgId;
  if (!buyerOrgId) {
    const membership = context.authorizer
      .listMemberships()
      .find((member) => member.organizationType === "buyer");
    if (!membership) {
      throw new AppError("You do not have a buyer organization yet.", {
        status: 400,
        code: "buyer_org_missing",
      });
    }
    buyerOrgId = membership.organizationId;
  }

  context.authorizer.ensureBuyerOrg(buyerOrgId);

  const now = new Date().toISOString();

  const inserted = await repo.insertRequest(
    {
      buyer_org_id: buyerOrgId,
      oem_org_id: input.oemOrgId,
      type: input.type,
      status: "submitted",
      title: input.title,
      product_brief: input.productBrief,
      quantity_min: input.quantityMin,
      quantity_max: input.quantityMax ?? null,
      unit: input.unit,
      timeline: input.timeline ?? null,
      shipping_terms: input.shippingTerms ?? null,
      payment_terms: input.paymentTerms ?? null,
      add_escrow: input.addEscrow ?? null,
      add_audit: input.addAudit ?? null,
      submitted_at: now,
      created_by: context.userId,
      updated_by: context.userId,
    },
    context.supabase
  );

  // Generate matches for this request asynchronously (don't block response)
  // If an oemOrgId is specified, only create a match with that specific OEM
  generateMatchesForRequest(
    inserted.id,
    {
      buyerOrgId,
      oemOrgId: input.oemOrgId, // Pass the specific OEM ID
      type: input.type,
      productBrief: input.productBrief,
      quantityMin: input.quantityMin,
      quantityMax: input.quantityMax,
      timeline: input.timeline,
      shippingTerms: input.shippingTerms,
    },
    context as SupabaseRouteContext
  ).catch((error) => {
    console.error("Failed to generate matches for request:", error);
    // Don't fail the request if matching fails
  });

  return inserted;
};

export const listRequests = async (
  params: URLSearchParams,
  context: RequestServiceContext
) => {
  const parsed = parseListRequestsParams(params);

  if (parsed.buyerOrgId) {
    context.authorizer.ensureMembership(parsed.buyerOrgId);
  }

  if (parsed.oemOrgId) {
    context.authorizer.ensureMembership(parsed.oemOrgId);
  }

  let memberOrgIds: string[] | undefined;
  if (!parsed.buyerOrgId && !parsed.oemOrgId && !context.authorizer.isAdmin()) {
    memberOrgIds = context.authorizer
      .listMemberships()
      .map((membership) => membership.organizationId);
  }

  const requests = await repo.findRequests(
    {
      buyerOrgId: parsed.buyerOrgId,
      oemOrgId: parsed.oemOrgId,
      statuses: parsed.statuses,
      memberOrgIds,
      limit: parsed.limit,
    },
    context.supabase
  );

  return requests;
};
