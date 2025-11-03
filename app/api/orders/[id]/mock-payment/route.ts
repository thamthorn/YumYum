import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteContext } from "@/lib/http/route-context";
import { AppError } from "@/utils/errors";

/**
 * Mock Payment Endpoint
 * Simulates payment processing but actually creates real database records
 * for testing and development purposes
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const body = await request.json();
    const { paymentType, amount, shippingPreference, buyerAddress } = body;

    const context = await createSupabaseRouteContext();
    const { supabase, user } = context;

    if (!user) {
      throw new AppError("Unauthorized", { status: 401 });
    }

    // Validate payment type
    if (!["deposit", "balance", "full_payment"].includes(paymentType)) {
      throw new AppError("Invalid payment type", { status: 400 });
    }

    // Get current order
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*, buyer_org_id, oem_org_id")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      throw new AppError("Order not found", { status: 404 });
    }

    // Validate amount
    if (!amount || amount <= 0) {
      throw new AppError("Invalid payment amount", { status: 400 });
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        order_id: orderId,
        buyer_org_id: order.buyer_org_id,
        oem_org_id: order.oem_org_id,
        amount,
        currency: order.currency || "THB",
        payment_type: paymentType,
        payment_method: "other", // Using 'other' as mock payment is not a real payment method
        status: "completed", // Mock payment is instantly completed
        gateway_name: "mock",
        gateway_transaction_id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        paid_at: new Date().toISOString(),
        description: `Mock ${paymentType} payment for order ${orderId}`,
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Error creating payment:", paymentError);
      throw new AppError("Failed to process payment", { status: 500 });
    }

    // If order has escrow enabled, create escrow record
    // Check if order's original request had add_escrow enabled
    let escrowCreated = false;

    // For now, we'll create escrow for all payments (you can add logic to check request.add_escrow)
    const shouldCreateEscrow = true;

    if (shouldCreateEscrow) {
      const { error: escrowError } = await supabase.from("escrow").insert({
        order_id: orderId,
        payment_id: payment.id,
        buyer_org_id: order.buyer_org_id,
        oem_org_id: order.oem_org_id,
        amount,
        currency: order.currency || "THB",
        status: "held", // Money is held in escrow
        held_at: new Date().toISOString(),
        auto_release_date: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(), // Auto-release after 30 days
        release_conditions: {
          type: "on_delivery",
          requires_approval: false,
        },
      });

      if (escrowError) {
        console.error("Error creating escrow:", escrowError);
        // Don't fail the payment, just log the error
      } else {
        escrowCreated = true;
      }
    }

    // Determine new order status based on payment type
    let newStatus:
      | "signed"
      | "preparation"
      | "manufacturing"
      | "delivering"
      | "completed"
      | "cancelled" = order.status;

    if (paymentType === "deposit") {
      newStatus = "manufacturing";
    } else if (paymentType === "balance" || paymentType === "full_payment") {
      newStatus = "delivering";
    }

    // Prepare order update data
    const orderUpdate: {
      status: typeof newStatus;
      updated_at: string;
      shipping_preference?: string;
      shipping_address?: string;
    } = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    // If shipping info provided (for balance payment), save it
    if (shippingPreference) {
      orderUpdate.shipping_preference = shippingPreference;
      if (shippingPreference === "buyer-address" && buyerAddress) {
        orderUpdate.shipping_address = buyerAddress;
      }
    }

    // Update order status and shipping info
    const { error: updateError } = await supabase
      .from("orders")
      .update(orderUpdate)
      .eq("id", orderId);

    if (updateError) {
      console.error("Error updating order:", updateError);
      throw new AppError("Failed to update order status", { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Mock payment processed successfully",
        data: {
          payment: {
            id: payment.id,
            amount,
            currency: payment.currency,
            type: paymentType,
            status: "completed",
            paidAt: payment.paid_at,
          },
          escrow: escrowCreated
            ? {
                created: true,
                amount,
                status: "held",
                message: "Funds held in escrow until delivery",
              }
            : null,
          order: {
            id: orderId,
            newStatus,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: { message: error.message } },
        { status: error.status }
      );
    }

    console.error(
      "Unexpected error in POST /api/orders/[id]/mock-payment:",
      error
    );
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
