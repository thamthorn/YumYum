import { z } from "zod";
import type {
  RequestStatus as RequestStatusType,
  RequestType as RequestTypeType,
} from "@/types/database";

export const REQUEST_STATUS_VALUES = [
  "draft",
  "submitted",
  "pending_oem",
  "quote_received",
  "in_review",
  "accepted",
  "in_production",
  "completed",
  "cancelled",
] as const satisfies RequestStatusType[];

export const REQUEST_TYPE_VALUES = ["quote", "prototype"] as const satisfies
  RequestTypeType[];

export const createRequestSchema = z
  .object({
    buyerOrgId: z.string().uuid().optional(),
    oemOrgId: z.string().uuid(),
    type: z.enum(REQUEST_TYPE_VALUES).default("quote"),
    title: z.string().trim().min(1).max(120),
    productBrief: z.string().trim().min(1),
    quantityMin: z.number().int().positive(),
    quantityMax: z.number().int().positive().optional(),
    unit: z.string().trim().min(1).max(32).default("units"),
    timeline: z.string().trim().max(120).optional(),
    shippingTerms: z.string().trim().max(240).optional(),
    paymentTerms: z.string().trim().max(240).optional(),
    addEscrow: z.boolean().optional(),
    addAudit: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      typeof data.quantityMax === "number" &&
      data.quantityMax < data.quantityMin
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "quantityMax must be greater than or equal to quantityMin",
        path: ["quantityMax"],
      });
    }
  });

export const listRequestsQuerySchema = z.object({
  buyerOrgId: z.string().uuid().optional(),
  oemOrgId: z.string().uuid().optional(),
  statuses: z
    .array(z.enum(REQUEST_STATUS_VALUES))
    .max(REQUEST_STATUS_VALUES.length)
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type ListRequestsQuery = z.infer<typeof listRequestsQuerySchema>;

export const parseRequestStatus = (status: string): RequestStatusType | null =>
  REQUEST_STATUS_VALUES.includes(status as RequestStatusType)
    ? (status as RequestStatusType)
    : null;

export const parseRequestStatuses = (
  param: string[] | null
): RequestStatusType[] | undefined => {
  if (!param || param.length === 0) return undefined;
  const statuses = param
    .flatMap((value) => value.split(","))
    .map((value) => parseRequestStatus(value))
    .filter((value): value is RequestStatusType => Boolean(value));
  return statuses.length > 0 ? statuses : undefined;
};

export const parseListRequestsParams = (
  params: URLSearchParams
): ListRequestsQuery => {
  const raw = {
    buyerOrgId: params.get("buyerOrgId") ?? undefined,
    oemOrgId: params.get("oemOrgId") ?? undefined,
    statuses: parseRequestStatuses(params.getAll("status")),
    limit: params.get("limit") ?? undefined,
  };

  return listRequestsQuerySchema.parse(raw);
};
