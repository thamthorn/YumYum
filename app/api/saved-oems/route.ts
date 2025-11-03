import { NextResponse } from "next/server";
import { createSupabaseRouteContext } from "@/lib/http/route-context";

/**
 * GET /api/saved-oems
 * List all saved OEMs for the current buyer
 */
export async function GET() {
  try {
    const context = await createSupabaseRouteContext();

    // Get buyer organization
    const buyerMembership = context.authorizer
      .listMemberships()
      .find((member) => member.organizationType === "buyer");

    if (!buyerMembership) {
      return NextResponse.json(
        { error: "No buyer organization associated with this account" },
        { status: 404 }
      );
    }

    const { data: savedOems, error } = await context.supabase
      .from("buyer_saved_oems")
      .select(
        `
      oem_org_id,
      created_at,
      organizations!buyer_saved_oems_oem_org_id_fkey (
        id,
        display_name,
        slug
      )
    `
      )
      .eq("buyer_org_id", buyerMembership.organizationId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching saved OEMs:", error);
      return NextResponse.json(
        { error: "Failed to fetch saved OEMs" },
        { status: 500 }
      );
    }

    return NextResponse.json({ savedOems });
  } catch (error) {
    console.error("Unexpected error in GET /api/saved-oems:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/saved-oems
 * Save/bookmark an OEM
 */
export async function POST(request: Request) {
  try {
    const context = await createSupabaseRouteContext();

    // Get buyer organization
    const buyerMembership = context.authorizer
      .listMemberships()
      .find((member) => member.organizationType === "buyer");

    if (!buyerMembership) {
      return NextResponse.json(
        { error: "No buyer organization associated with this account" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { oemOrgId } = body;

    if (!oemOrgId) {
      return NextResponse.json(
        { error: "oemOrgId is required" },
        { status: 400 }
      );
    }

    // Check if already saved
    const { data: existing } = await context.supabase
      .from("buyer_saved_oems")
      .select("*")
      .eq("buyer_org_id", buyerMembership.organizationId)
      .eq("oem_org_id", oemOrgId)
      .single();

    if (existing) {
      return NextResponse.json({ error: "OEM already saved" }, { status: 409 });
    }

    const { error } = await context.supabase.from("buyer_saved_oems").insert({
      buyer_org_id: buyerMembership.organizationId,
      oem_org_id: oemOrgId,
    });

    if (error) {
      console.error("Error saving OEM:", error);
      return NextResponse.json(
        { error: "Failed to save OEM" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error in POST /api/saved-oems:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/saved-oems
 * Remove a bookmarked OEM
 */
export async function DELETE(request: Request) {
  try {
    const context = await createSupabaseRouteContext();

    // Get buyer organization
    const buyerMembership = context.authorizer
      .listMemberships()
      .find((member) => member.organizationType === "buyer");

    if (!buyerMembership) {
      return NextResponse.json(
        { error: "No buyer organization associated with this account" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const oemOrgId = searchParams.get("oemOrgId");

    if (!oemOrgId) {
      return NextResponse.json(
        { error: "oemOrgId is required" },
        { status: 400 }
      );
    }

    const { error } = await context.supabase
      .from("buyer_saved_oems")
      .delete()
      .eq("buyer_org_id", buyerMembership.organizationId)
      .eq("oem_org_id", oemOrgId);

    if (error) {
      console.error("Error removing saved OEM:", error);
      return NextResponse.json(
        { error: "Failed to remove saved OEM" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/saved-oems:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
