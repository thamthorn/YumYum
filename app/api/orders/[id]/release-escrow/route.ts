import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteContext } from "@/lib/http/route-context";
import { AppError } from "@/utils/errors";

/**
 * Mock Escrow Release Endpoint
 * Releases funds from escrow to OEM when order is completed
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    const context = await createSupabaseRouteContext();
    const { supabase, user } = context;

    if (!user) {
      throw new AppError("Unauthorized", { status: 401 });
    }

    // Get order and verify it's completed
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      throw new AppError("Order not found", { status: 404 });
    }

    if (order.status !== "completed") {
      throw new AppError("Can only release escrow for completed orders", {
        status: 400,
      });
    }

    // Find held escrow for this order
    const { data: escrows, error: escrowFetchError } = await supabase
      .from("escrow")
      .select("*")
      .eq("order_id", orderId)
      .eq("status", "held");

    if (escrowFetchError) {
      console.error("Error fetching escrow:", escrowFetchError);
      throw new AppError("Failed to fetch escrow", { status: 500 });
    }

    if (!escrows || escrows.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: "No held escrow found for this order",
          data: { released: 0 },
        },
        { status: 200 }
      );
    }

    // Release all held escrows for this order
    const escrowIds = escrows.map(
      (e: { id: string }) => e.id
    );

    const { error: releaseError } = await supabase
      .from("escrow")
      .update({
        status: "released",
        released_at: new Date().toISOString(),
        released_to: order.oem_org_id,
        released_by: user.id,
      })
      .in("id", escrowIds);

    if (releaseError) {
      console.error("Error releasing escrow:", releaseError);
      throw new AppError("Failed to release escrow", { status: 500 });
    }

    const totalReleased = escrows.reduce(
      (sum: number, e: { amount: number }) => sum + (e.amount || 0),
      0
    );

    return NextResponse.json(
      {
        success: true,
        message: "Escrow released successfully",
        data: {
          released: escrows.length,
          totalAmount: totalReleased,
          currency: order.currency || "THB",
          releasedTo: order.oem_org_id,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: { message: error.message } },
        { status: error.status }
      );
    }

    console.error(
      "Unexpected error in POST /api/orders/[id]/release-escrow:",
      error
    );
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
