import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get organization owned by user
    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("owner_id", user.id)
      .eq("type", "oem")
      .single();

    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Get OEM profile
    const { data: profile } = await supabase
      .from("oem_profiles")
      .select("organization_id")
      .eq("organization_id", org.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "OEM profile not found" },
        { status: 404 }
      );
    }

    // Get active subscription with tier details
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("oem_org_id", profile.organization_id)
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Get subscription error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tier } = body;

    if (!tier || !["FREE", "INSIGHTS", "VERIFIED_PARTNER"].includes(tier)) {
      return NextResponse.json(
        { error: "Invalid tier. Must be FREE, INSIGHTS, or VERIFIED_PARTNER" },
        { status: 400 }
      );
    }

    // Get organization owned by user
    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("owner_id", user.id)
      .eq("type", "oem")
      .single();

    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Get OEM profile
    const { data: profile } = await supabase
      .from("oem_profiles")
      .select("organization_id")
      .eq("organization_id", org.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "OEM profile not found" },
        { status: 404 }
      );
    }

    // Calculate period dates
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1); // 1 month subscription

    // Check if subscription exists (there's a unique constraint on oem_org_id)
    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("oem_org_id", profile.organization_id)
      .maybeSingle();

    let subscription;
    let error;

    if (existingSubscription) {
      // Update existing subscription
      const { data: updatedSub, error: updateError } = await supabase
        .from("subscriptions")
        .update({
          tier: tier,
          status: "ACTIVE",
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: false,
        })
        .eq("id", existingSubscription.id)
        .select()
        .single();

      subscription = updatedSub;
      error = updateError;
    } else {
      // Insert new subscription (requires INSERT policy)
      const { data: newSub, error: insertError } = await supabase
        .from("subscriptions")
        .insert({
          oem_org_id: profile.organization_id,
          tier: tier,
          status: "ACTIVE",
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: false,
        })
        .select()
        .single();

      subscription = newSub;
      error = insertError;
    }

    if (error) {
      console.error("Subscription error:", error);
      return NextResponse.json(
        {
          error:
            error.message ||
            "Failed to create subscription. Please ensure you have the necessary permissions. If this is your first subscription, you may need to apply the database migration.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    console.error("Create subscription error:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
