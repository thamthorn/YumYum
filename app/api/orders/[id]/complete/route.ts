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

    // Release all held escrow for this order
    const { data: escrowRecords, error: escrowFindError } = await supabase
      .from("escrow")
      .select("id, amount, currency")
      .eq("order_id", orderId)
      .eq("status", "held");

    if (escrowFindError) {
      console.error("Error finding escrow records:", escrowFindError);
      // Continue anyway - order status is updated
    }

    let releasedCount = 0;
    let totalReleased = 0;
    let currency = "THB";

    if (escrowRecords && escrowRecords.length > 0) {
      const { error: releaseError } = await supabase
        .from("escrow")
        .update({
          status: "released",
          released_at: new Date().toISOString(),
        })
        .eq("order_id", orderId)
        .eq("status", "held");

      if (releaseError) {
        console.error("Error releasing escrow:", releaseError);
        throw new AppError("Failed to release escrow funds", { status: 500 });
      }

      releasedCount = escrowRecords.length;
      totalReleased = escrowRecords.reduce(
        (sum: number, record: { amount: number }) => sum + record.amount,
        0
      );
      currency = escrowRecords[0].currency;
    }

    // TODO: In production
    // - Send confirmation email to buyer and OEM
    // - Trigger withdrawal notification to OEM

    return NextResponse.json(
      {
        success: true,
        message: `Order completed successfully. ${releasedCount > 0 ? `Released ${totalReleased} ${currency} from escrow to OEM.` : "No escrow to release."}`,
        order: {
          id: orderId,
          status: "completed",
        },
        escrowReleased: {
          count: releasedCount,
          totalAmount: totalReleased,
          currency,
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
