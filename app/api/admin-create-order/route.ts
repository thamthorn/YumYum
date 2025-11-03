import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteContext } from "@/lib/http/route-context";
import { AppError } from "@/utils/errors";

type LineItem = {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
};

type CreateOrderRequest = {
  request_id: string;
  status: string;
  line_items: LineItem[];
};

export async function POST(request: NextRequest) {
  try {
    const context = await createSupabaseRouteContext();
    const { supabase, userId } = context;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as CreateOrderRequest;
    const { request_id, status, line_items } = body;

    if (!request_id || !status || !line_items || line_items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: request_id, status, or line_items" },
        { status: 400 }
      );
    }

    // Get the request details
    const { data: requestData, error: requestError } = await supabase
      .from("requests")
      .select("id, buyer_org_id, oem_org_id")
      .eq("id", request_id)
      .single();

    if (requestError || !requestData) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (!requestData.oem_org_id) {
      return NextResponse.json(
        { error: "Request does not have an assigned OEM" },
        { status: 400 }
      );
    }

    // Calculate total
    const totalValue = line_items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );

    const quantityTotal = line_items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    // Create the order
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        buyer_org_id: requestData.buyer_org_id,
        oem_org_id: requestData.oem_org_id,
        request_id: request_id,
        status: status as
          | "signed"
          | "preparation"
          | "manufacturing"
          | "delivering"
          | "completed"
          | "cancelled",
        total_value: totalValue,
        currency: "THB",
        quantity_total: quantityTotal,
        unit: line_items[0]?.unit || "pieces",
      })
      .select()
      .single();

    if (orderError || !orderData) {
      console.error("Error creating order:", orderError);
      return NextResponse.json(
        {
          error:
            "Failed to create order: " +
            (orderError?.message || "Unknown error"),
        },
        { status: 500 }
      );
    }

    // Create line items
    const lineItemsData = line_items.map((item) => ({
      order_id: orderData.id,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      currency: "THB",
    }));

    const { error: lineItemsError } = await supabase
      .from("order_line_items")
      .insert(lineItemsData);

    if (lineItemsError) {
      console.error("Error creating line items:", lineItemsError);
      // Rollback: delete the order
      await supabase.from("orders").delete().eq("id", orderData.id);
      return NextResponse.json(
        { error: "Failed to create order line items" },
        { status: 500 }
      );
    }

    // Update request status to 'accepted' (only if current status is 'quote_received')
    const { error: requestUpdateError } = await supabase
      .from("requests")
      .update({ status: "accepted" })
      .eq("id", request_id)
      .eq("status", "quote_received");

    if (requestUpdateError) {
      console.error("Failed to update request status:", requestUpdateError);
      // Rollback: delete line items and order
      await supabase
        .from("order_line_items")
        .delete()
        .eq("order_id", orderData.id);
      await supabase.from("orders").delete().eq("id", orderData.id);
      return NextResponse.json(
        { error: "Failed to update request status to accepted" },
        { status: 500 }
      );
    }

    // Create order event
    const { error: eventError } = await supabase.from("order_events").insert({
      order_id: orderData.id,
      event_type: "status_change" as const,
      stage: status as
        | "signed"
        | "preparation"
        | "manufacturing"
        | "delivering"
        | "completed"
        | "cancelled",
      payload: {
        message: `Order created from request ${request_id}`,
        request_id: request_id,
      },
      created_by: userId,
    });

    if (eventError) {
      console.warn("Warning: Failed to create order event:", eventError);
      // Don't rollback, just log the warning
    }

    return NextResponse.json(
      {
        success: true,
        order: orderData,
        message: "Order created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("Unexpected error in POST /api/admin-create-order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
