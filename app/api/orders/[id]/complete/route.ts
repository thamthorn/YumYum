import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteContext } from "@/lib/http/route-context";
import { AppError } from "@/utils/errors";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    const context = await createSupabaseRouteContext();
    const { supabase } = context;

    // Get current order
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      throw new AppError("Order not found", { status: 404 });
    }

    // Validate that order is in delivering status
    if (order.status !== "delivering") {
      throw new AppError(
        "Order must be in delivering status to confirm delivery",
        { status: 400 }
      );
    }

    // Update order status to completed
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Error updating order:", updateError);
      throw new AppError("Failed to complete order", { status: 500 });
    }

    // TODO: In production
    // - Release escrow payment to OEM
    // - Send confirmation email to buyer and OEM
    // - Update payment records

    return NextResponse.json(
      {
        success: true,
        message: "Order completed successfully",
        order: {
          id: orderId,
          status: "completed",
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

    console.error(`Unexpected error in POST /api/orders/[id]/complete:`, error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
