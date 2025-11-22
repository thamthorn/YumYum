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

    // Resolve organization for current user, then find OEM profile
    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const { data: profile } = await supabase
      .from("oem_profiles")
      .select("id")
      .eq("organization_id", org.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "OEM profile not found" },
        { status: 404 }
      );
    }

    // Get all media
    const { data: media, error } = await supabase
      .from("oem_media")
      .select("*")
      .eq("oem_org_id", org.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ media });
  } catch (error) {
    console.error("Get media error:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
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

    // Resolve org and profile, then check active subscription tier
    const { data: orgForPost } = await supabase
      .from("organizations")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!orgForPost) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const { data: profileWithId } = await supabase
      .from("oem_profiles")
      .select("id")
      .eq("organization_id", orgForPost.id)
      .single();

    if (!profileWithId) {
      return NextResponse.json(
        { error: "OEM profile not found" },
        { status: 404 }
      );
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("tier, status")
      .eq("oem_org_id", orgForPost.id)
      .eq("status", "active")
      .single();

    if (!subscription || subscription.tier !== "VERIFIED_PARTNER") {
      return NextResponse.json(
        { error: "Media upload is only available for Verified Partner tier" },
        { status: 403 }
      );
    }

    // Create media record
    const { data: media, error } = await supabase
      .from("oem_media")
      .insert({
        oem_org_id: orgForPost.id,
        media_type: body.mediaType,
        title: body.title,
        video_url: body.mediaUrl ?? null,
        thumbnail_url: body.thumbnailUrl ?? null,
        external_link: body.externalLink ?? null,
        display_order: body.displayOrder ?? 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, media });
  } catch (error) {
    console.error("Create media error:", error);
    return NextResponse.json(
      { error: "Failed to upload media" },
      { status: 500 }
    );
  }
}
