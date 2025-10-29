import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/domain/orders/service";
import { createSupabaseRouteContext } from "@/lib/http/route-context";
import { AppError } from "@/utils/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const context = await createSupabaseRouteContext();
    const order = await getOrderById(id, context);

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error(`Unexpected error in GET /api/orders/[id]:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
