import type { SupabaseRouteContext } from "@/lib/http/route-context";
import { AppError } from "@/utils/errors";
import type { Database } from "@/types/database";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderEventRow = Database["public"]["Tables"]["order_events"]["Row"];
type OrderLineItemRow = Database["public"]["Tables"]["order_line_items"]["Row"];
type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];

export interface OrderWithDetails extends OrderRow {
  oem_organization: Pick<
    OrganizationRow,
    "id" | "display_name" | "slug"
  > | null;
  buyer_organization: Pick<OrganizationRow, "id" | "display_name"> | null;
  order_line_items: OrderLineItemRow[];
  order_events: OrderEventRow[];
}

export const getOrdersByBuyer = async (
  context: SupabaseRouteContext
): Promise<OrderWithDetails[]> => {
  const { supabase, session } = context;
  const userId = session.user.id;

  // Get buyer organization
  const { data: membership, error: membershipError } = await supabase
    .from("organization_members")
    .select("organization_id, organizations!inner(id, type)")
    .eq("profile_id", userId)
    .eq("organizations.type", "buyer")
    .single();

  if (membershipError || !membership) {
    throw new AppError("Buyer organization not found", { status: 404 });
  }

  const buyerOrgId = membership.organization_id;

  // Fetch orders with related data
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(
      `
      *,
      oem_organization:organizations!orders_oem_org_id_fkey(id, display_name, slug),
      buyer_organization:organizations!orders_buyer_org_id_fkey(id, display_name),
      order_line_items(*),
      order_events(*)
    `
    )
    .eq("buyer_org_id", buyerOrgId)
    .order("created_at", { ascending: false });

  if (ordersError) {
    throw new AppError("Failed to fetch orders", {
      status: 500,
      cause: ordersError,
    });
  }

  return orders as unknown as OrderWithDetails[];
};

export const getOrderById = async (
  orderId: string,
  context: SupabaseRouteContext
): Promise<OrderWithDetails> => {
  const { supabase, session } = context;
  const userId = session.user.id;

  // Get buyer organization
  const { data: membership, error: membershipError } = await supabase
    .from("organization_members")
    .select("organization_id, organizations!inner(id, type)")
    .eq("profile_id", userId)
    .eq("organizations.type", "buyer")
    .single();

  if (membershipError || !membership) {
    throw new AppError("Buyer organization not found", { status: 404 });
  }

  const buyerOrgId = membership.organization_id;

  // Fetch order with related data
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      `
      *,
      oem_organization:organizations!orders_oem_org_id_fkey(id, display_name, slug),
      buyer_organization:organizations!orders_buyer_org_id_fkey(id, display_name),
      order_line_items(*),
      order_events(*)
    `
    )
    .eq("id", orderId)
    .eq("buyer_org_id", buyerOrgId)
    .single();

  if (orderError || !order) {
    throw new AppError("Order not found", { status: 404, cause: orderError });
  }

  return order as unknown as OrderWithDetails;
};
