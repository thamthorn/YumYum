import { NextResponse } from "next/server";
import { createSupabaseRouteContext } from "@/lib/http/route-context";
import { AppError } from "@/utils/errors";

export async function POST(request: Request) {
  try {
    const context = await createSupabaseRouteContext();
    const { supabase, user } = context;

    if (!user) {
      throw new AppError("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { amount, bankName, accountNumber, accountHolderName, notes } = body;

    // Validate input
    if (!amount || amount <= 0) {
      throw new AppError("Invalid withdrawal amount", { status: 400 });
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

    // Check available balance
    const { data: financials, error: financialsError } = await supabase.rpc(
      "get_oem_available_balance",
      { p_oem_org_id: oemOrgId }
    );

    if (financialsError) {
      throw new AppError("Unable to fetch financial data", { status: 500 });
    }

    const availableBalance = parseFloat(financials?.toString() || "0");

    if (amount > availableBalance) {
      throw new AppError(
        `Insufficient balance. Available: ${availableBalance.toFixed(2)} THB`,
        { status: 400 }
      );
    }

    // Create withdrawal request via RPC
    const { data: withdrawalId, error: withdrawalError } = await supabase.rpc(
      "create_withdrawal_request",
      {
        p_oem_org_id: oemOrgId,
        p_amount: amount,
        p_bank_name: bankName,
        p_account_number: accountNumber,
        p_account_holder_name: accountHolderName,
        p_notes: notes,
        p_requested_by: user.id,
      }
    );

    if (withdrawalError) {
      console.error("Error creating withdrawal:", withdrawalError);
      throw new AppError("Failed to create withdrawal request", {
        status: 500,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Withdrawal request submitted successfully",
        data: {
          id: withdrawalId,
          amount,
          currency: "THB",
          status: "pending",
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

    console.error("Unexpected error in POST /api/oem/withdrawals:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}

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
      .select("organization_id")
      .eq("profile_id", user.id)
      .single();

    if (orgError || !orgMember) {
      throw new AppError("Organization not found", { status: 404 });
    }

    // Get all withdrawals for this OEM via RPC
    const { data: withdrawals, error: withdrawalsError } = await supabase.rpc(
      "get_oem_withdrawals",
      {
        p_oem_org_id: orgMember.organization_id,
      }
    );

    if (withdrawalsError) {
      console.error("Error fetching withdrawals:", withdrawalsError);
      throw new AppError("Failed to fetch withdrawals", { status: 500 });
    }

    return NextResponse.json({
      data: withdrawals || [],
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: { message: error.message } },
        { status: error.status }
      );
    }

    console.error("Unexpected error in GET /api/oem/withdrawals:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
