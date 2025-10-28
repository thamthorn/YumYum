import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  RequestStatus,
  Tables,
  TablesInsert,
} from "@/types/database";
import { AppError } from "@/utils/errors";

type RequestsTable = Tables<"requests">;
type InsertRequest = TablesInsert<"requests">;
type RequestsClient = SupabaseClient<Database>;

export interface RequestFilters {
  buyerOrgId?: string;
  oemOrgId?: string;
  statuses?: RequestStatus[];
  memberOrgIds?: string[];
  limit?: number;
}

export const insertRequest = async (
  input: InsertRequest,
  supabase: RequestsClient
): Promise<RequestsTable> => {
  const { data, error } = await supabase
    .from("requests")
    .insert(input)
    .select()
    .single();

  if (error) {
    throw new AppError("Failed to create request", {
      cause: error,
      code: "request_create_failed",
    });
  }

  return data;
};

export const findRequests = async (
  filters: RequestFilters,
  supabase: RequestsClient
): Promise<RequestsTable[]> => {
  const { buyerOrgId, oemOrgId, statuses, memberOrgIds, limit = 20 } = filters;

  if (
    !buyerOrgId &&
    !oemOrgId &&
    memberOrgIds &&
    memberOrgIds.length === 0
  ) {
    return [];
  }

  let query = supabase
    .from("requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (buyerOrgId) {
    query = query.eq("buyer_org_id", buyerOrgId);
  }

  if (oemOrgId) {
    query = query.eq("oem_org_id", oemOrgId);
  }

  if (statuses && statuses.length > 0) {
    query = query.in("status", statuses);
  }

  if (!buyerOrgId && !oemOrgId && memberOrgIds && memberOrgIds.length > 0) {
    const list = memberOrgIds.join(",");
    query = query.or(`buyer_org_id.in.(${list}),oem_org_id.in.(${list})`);
  }

  const { data, error } = await query;

  if (error) {
    throw new AppError("Failed to fetch requests", {
      cause: error,
      code: "request_query_failed",
    });
  }

  return data ?? [];
};
