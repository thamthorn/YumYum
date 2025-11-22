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

    // Get OEM profile
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

    // Get all certifications
    const { data: certifications, error } = await supabase
      .from("oem_certifications")
      .select("*")
      .eq("oem_org_id", org.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ certifications });
  } catch (error) {
    console.error("Get certifications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch certifications" },
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

    // Get OEM profile (need organization_id)
    const { data: profile, error: profileErr } = await supabase
      .from("oem_profiles")
      .select("organization_id")
      .eq("user_id", user.id)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json(
        { error: profileErr?.message || "OEM profile not found" },
        { status: 404 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: "OEM profile not found" },
        { status: 404 }
      );
    }

    // Create a certifications record (store metadata in description) then link it to OEM
    const certDescription = JSON.stringify({
      issuedBy: body.issuedBy || null,
      certificateNumber: body.certificateNumber || null,
      issueDate: body.issueDate || null,
      expiryDate: body.expiryDate || null,
    });

    const { data: createdCertification, error: certError } = await supabase
      .from("certifications")
      .insert([
        {
          name: body.certificationType || "",
          description: certDescription,
        },
      ])
      .select()
      .single();

    if (certError) {
      return NextResponse.json({ error: certError.message }, { status: 500 });
    }

    // Link created certification to OEM organization
    const { data: certification, error } = await supabase
      .from("oem_certifications")
      .insert([
        {
          certification_id: createdCertification.id,
          oem_org_id: profile.organization_id,
          verification_tier: "none",
          verified: false,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, certification });
  } catch (error) {
    console.error("Create certification error:", error);
    return NextResponse.json(
      { error: "Failed to create certification" },
      { status: 500 }
    );
  }
}
