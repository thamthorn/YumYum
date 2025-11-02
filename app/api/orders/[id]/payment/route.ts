import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteContext } from "@/lib/http/route-context";
import { AppError } from "@/utils/errors";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const body = await request.json();
    const { paymentType } = body;

    const context = await createSupabaseRouteContext();
    const { supabase } = context;

    // Validate payment type
    if (!["deposit", "balance"].includes(paymentType)) {
      throw new AppError("Invalid payment type", { status: 400 });
    }

    // Get current order
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      throw new AppError("Order not found", { status: 404 });
    }

    // Determine new status based on payment type
    let newStatus = order.status;

    if (paymentType === "deposit") {
      // After deposit payment, order moves to manufacturing
      newStatus = "manufacturing";
    } else if (paymentType === "balance") {
      // After balance payment, order moves to delivering (ready to ship)
      newStatus = "delivering";
    }

    // Update order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Error updating order:", updateError);
      throw new AppError("Failed to update order payment status", {
        status: 500,
      });
    }

    // TODO: In production, integrate with real payment gateway here
    // - Process payment with Stripe/PayPal/etc
    // - Create payment record in database
    // - Send confirmation email

    return NextResponse.json(
      {
        success: true,
        message: "Payment processed successfully",
        order: {
          id: orderId,
          status: newStatus,
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

    console.error(`Unexpected error in POST /api/orders/[id]/payment:`, error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
