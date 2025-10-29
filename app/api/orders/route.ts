import { NextResponse } from "next/server";
import { getOrdersByBuyer } from "@/domain/orders/service";
import { createSupabaseRouteContext } from "@/lib/http/route-context";
import { AppError } from "@/utils/errors";

export async function GET() {
  try {
    const context = await createSupabaseRouteContext();
    const orders = await getOrdersByBuyer(context);

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("Unexpected error in GET /api/orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
