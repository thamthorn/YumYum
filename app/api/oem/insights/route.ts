import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30"; // days

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

    // Check if OEM has Insights access
    const { data: hasAccess } = await supabase.rpc("oem_has_insights_access", {
      org_id: profile.organization_id,
    });

    if (!hasAccess) {
      return NextResponse.json(
        {
          error:
            "Insights access required. Upgrade to Insights or Verified Partner tier.",
        },
        { status: 403 }
      );
    }

    const periodStart = new Date(
      Date.now() - parseInt(period) * 24 * 60 * 60 * 1000
    ).toISOString();

    // Get analytics events
    const { data: events, error: eventsError } = await supabase
      .from("oem_analytics_events")
      .select("*")
      .eq("oem_org_id", profile.organization_id)
      .gte("created_at", periodStart)
      .order("created_at", { ascending: false });

    if (eventsError) {
      return NextResponse.json({ error: eventsError.message }, { status: 500 });
    }

    // Get keyword traffic
    const { data: keywords, error: keywordsError } = await supabase
      .from("oem_keyword_traffic")
      .select("*")
      .eq("oem_org_id", profile.organization_id)
      .order("count", { ascending: false })
      .limit(20);

    if (keywordsError) {
      return NextResponse.json(
        { error: keywordsError.message },
        { status: 500 }
      );
    }

    // Calculate summary stats (using uppercase event types from enum)
    const eventsList = events || [];

    const profileViews = eventsList.filter((e: any) => e.event_type === "PROFILE_VIEW").length;
    const contactClicks = eventsList.filter((e: any) => e.event_type === "CONTACT_CLICK").length;
    const rfqSent = eventsList.filter((e: any) => e.event_type === "RFQ_SENT").length;
    const productViews = eventsList.filter((e: any) => e.event_type === "PRODUCT_VIEW").length;

    // Group events by date for chart
    const eventsByDate = eventsList.reduce((acc: any, event: any) => {
      const date = new Date(event.created_at).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          profile_views: 0,
          contact_clicks: 0,
          rfq_sent: 0,
          product_views: 0,
        };
      }
      if (event.event_type === "PROFILE_VIEW") acc[date].profile_views++;
      if (event.event_type === "CONTACT_CLICK") acc[date].contact_clicks++;
      if (event.event_type === "RFQ_SENT") acc[date].rfq_sent++;
      if (event.event_type === "PRODUCT_VIEW") acc[date].product_views++;
      return acc;
    }, {});

    const chartData = Object.values(eventsByDate);

    return NextResponse.json({
      summary: {
        profileViews,
        contactClicks,
        rfqSent,
        productViews,
      },
      chartData,
      keywords: keywords || [],
      period: parseInt(period),
    });
  } catch (error) {
    console.error("Get insights error:", error);
    return NextResponse.json(
      { error: "Failed to fetch insights" },
      { status: 500 }
    );
  }
}
