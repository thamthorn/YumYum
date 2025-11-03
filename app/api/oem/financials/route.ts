import { NextResponse } from "next/server";
import { createSupabaseRouteContext } from "@/lib/http/route-context";
import { AppError } from "@/utils/errors";

export async function GET() {
  try {
    const context = await createSupabaseRouteContext();
    const { supabase, user } = context;

    if (!user) {
      throw new AppError("Unauthorized", { status: 401 });
    }

    // Get user's OEM organization
    const { data: orgMember, error: orgError } = await supabase
      .from("organization_members")
      .select(
        `
        organization_id,
        organizations!inner (
          id,
          type,
          display_name
        )
      `
      )
      .eq("profile_id", user.id)
      .eq("organizations.type", "oem")
      .single();

    if (orgError || !orgMember) {
      throw new AppError("OEM organization not found", { status: 404 });
    }

    const oemOrgId = orgMember.organization_id;
    const oemOrgName =
      (orgMember as { organizations?: { display_name?: string } })
        .organizations?.display_name || "OEM Organization";

    // Get financial summary from view
    const { data: financials, error: financialsError } = await supabase
      .from("oem_financials")
      .select("*")
      .eq("oem_org_id", oemOrgId)
      .single();

    if (financialsError) {
      console.error("Error fetching OEM financials:", financialsError);
      // Return zeros if no data yet
      return NextResponse.json({
        data: {
          totalEarnings: "0.00",
          escrowBalance: "0.00",
          releasedBalance: "0.00",
          totalWithdrawn: "0.00",
          pendingWithdrawals: "0.00",
          availableBalance: "0.00",
          totalTransactions: 0,
          activeEscrows: 0,
          lastTransactionAt: null,
          currency: "THB",
        },
      });
    }

    // Get recent transactions
    const { data: recentPayments } = await supabase
      .from("payments")
      .select(
        `
        id,
        amount,
        currency,
        payment_type,
        status,
        paid_at,
        created_at,
        orders!inner (
          id,
          buyer_org_id,
          organizations!orders_buyer_org_id_fkey (
            display_name
          )
        )
      `
      )
      .eq("oem_org_id", oemOrgId)
      .order("created_at", { ascending: false })
      .limit(10);

    // Get active escrows
    const { data: activeEscrows } = await supabase
      .from("escrow")
      .select(
        `
        id,
        amount,
        currency,
        status,
        held_at,
        auto_release_date,
        orders!inner (
          id,
          buyer_org_id,
          organizations!orders_buyer_org_id_fkey (
            display_name
          )
        )
      `
      )
      .eq("oem_org_id", oemOrgId)
      .eq("status", "held")
      .order("held_at", { ascending: false });

    // Get recent withdrawals
    const { data: recentWithdrawals } = await supabase
      .from("withdrawals")
      .select(
        `
        id,
        amount,
        currency,
        status,
        requested_at,
        processed_at,
        failure_reason
      `
      )
      .eq("oem_org_id", oemOrgId)
      .order("requested_at", { ascending: false })
      .limit(5);

    return NextResponse.json({
      data: {
        organizationName: oemOrgName,
        organizationId: oemOrgId,
        totalEarnings: financials.total_earnings || "0.00",
        escrowBalance: financials.escrow_balance || "0.00",
        releasedBalance: financials.released_balance || "0.00",
        totalWithdrawn: financials.total_withdrawn || "0.00",
        pendingWithdrawals: financials.pending_withdrawals || "0.00",
        availableBalance: financials.available_balance || "0.00",
        totalTransactions: financials.total_transactions || 0,
        activeEscrows: financials.active_escrows || 0,
        lastTransactionAt: financials.last_transaction_at,
        currency: "THB",
        recentPayments: recentPayments || [],
        activeEscrowsList: activeEscrows || [],
        recentWithdrawals: recentWithdrawals || [],
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: { message: error.message } },
        { status: error.status }
      );
    }

    console.error("Unexpected error in GET /api/oem/financials:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
