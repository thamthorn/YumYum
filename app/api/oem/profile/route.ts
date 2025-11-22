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

    // Get OEM profile with related data
    // First get organization owned by user
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

    const { data: profile, error } = await supabase
      .from("oem_profiles")
      .select(
        `
        *,
        oem_capabilities(*)
      `
      )
      .eq("organization_id", org.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get subscriptions separately (avoids cross-relation select issues)
    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("oem_org_id", org.id);

    const activeSubscription = subscriptions?.find(
      (sub: any) => String(sub.status).toLowerCase() === "active"
    );

    return NextResponse.json({
      profile: {
        ...profile,
        currentTier: activeSubscription?.tier || "FREE",
        subscription: activeSubscription,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get organization owned by user then OEM profile ID
    const { data: orgForPatch } = await supabase
      .from("organizations")
      .select("id")
      .eq("owner_id", user.id)
      .eq("type", "oem")
      .single();

    if (!orgForPatch) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Update organization-level fields (display_name, location, description, logo_url)
    const { data: updatedOrg, error: orgError } = await supabase
      .from("organizations")
      .update({
        display_name: body.companyName,
        location: body.location,
        description: body.description,
        logo_url: body.logo,
      })
      .eq("id", orgForPatch.id)
      .select()
      .single();

    if (orgError) {
      return NextResponse.json({ error: orgError.message }, { status: 500 });
    }

    // Update OEM-profile-specific fields
    const { data: updatedProfile, error: profileError } = await supabase
      .from("oem_profiles")
      .update({
        company_name_th: body.companyNameTH,
        line_id: body.lineId,
        wechat_id: body.wechatId,
        contact_person: body.contactPerson,
        contact_email: body.contactEmail,
        contact_phone: body.contactPhone,
      })
      .eq("organization_id", orgForPatch.id)
      .select()
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      organization: updatedOrg,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
