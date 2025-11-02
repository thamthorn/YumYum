import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteContext } from "@/lib/http/route-context";
import { AppError } from "@/utils/errors";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const context = await createSupabaseRouteContext();
    const supabase = context.supabase;

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new AppError("Unauthorized", { status: 401 });
    }

    // Get the order first to verify current status
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !order) {
      throw new AppError("Order not found", { status: 404 });
    }

    // Check if order can be cancelled (not already cancelled, completed, or delivered)
    const nonCancellableStatuses = [
      "cancelled",
      "completed",
      "delivered",
      "in_transit",
      "delivering",
    ];
    if (nonCancellableStatuses.includes(order.status)) {
      throw new AppError(`Cannot cancel order with status: ${order.status}`, {
        status: 400,
      });
    }

    // Update order status to cancelled
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      throw new AppError("Failed to cancel order", { status: 500 });
    }

    // Create an order event for the cancellation
    await supabase.from("order_events").insert({
      order_id: id,
      event_type: "status_change",
      stage: "cancelled",
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order cancelled successfully",
        order: updatedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error(`Unexpected error in POST /api/orders/[id]/cancel:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
