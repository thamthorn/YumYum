import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // FIX: Await the params before accessing properties
    const { id } = await params;

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership: get the media's oem_profile -> organization, then check organization's owner_id
    const { data: existing } = await supabase
      .from("oem_media")
      .select("oem_profiles!inner(organization_id)")
      .eq("id", id)
      .single();

    if (!existing || !existing.oem_profiles?.organization_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: org } = await supabase
      .from("organizations")
      .select("owner_id")
      .eq("id", existing.oem_profiles.organization_id)
      .single();

    if (!org || org.owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete media
    const { error } = await supabase.from("oem_media").delete().eq("id", id); // Use the resolved id here

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete media error:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
