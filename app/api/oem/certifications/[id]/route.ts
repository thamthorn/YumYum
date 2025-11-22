import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15: params is a Promise and must be awaited
    const { id } = await params;

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: certification, error } = await supabase
      .from("oem_certifications")
      .select("*")
      .eq("certification_id", id) // Query by certification_id per DB schema
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Verify ownership by checking the organization's owner_id
    const { data: org, error: orgErr } = await supabase
      .from("organizations")
      .select("owner_id")
      .eq("id", certification.oem_org_id)
      .single();

    if (orgErr) {
      return NextResponse.json({ error: orgErr.message }, { status: 500 });
    }

    if (org.owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ certification });
  } catch (error) {
    console.error("Get certification error:", error);
    return NextResponse.json(
      { error: "Failed to fetch certification" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15: params is a Promise and must be awaited
    const { id } = await params;

    const supabase = await createSupabaseServerClient();
    const body = await request.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership by finding the certification and checking organization owner
    const { data: existing } = await supabase
      .from("oem_certifications")
      .select("*")
      .eq("certification_id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: orgForExisting, error: orgForExistingErr } = await supabase
      .from("organizations")
      .select("owner_id")
      .eq("id", existing.oem_org_id)
      .single();

    if (orgForExistingErr) {
      return NextResponse.json(
        { error: orgForExistingErr.message },
        { status: 500 }
      );
    }

    if (orgForExisting.owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update certification - only update allowed oem_certifications fields
    const updatePayload: Partial<
      import("@/types/database").Database["public"]["Tables"]["oem_certifications"]["Update"]
    > = {};
    if (body.verification_tier !== undefined)
      updatePayload.verification_tier = body.verification_tier;
    if (body.verified !== undefined) updatePayload.verified = body.verified;
    if (body.verified_at !== undefined)
      updatePayload.verified_at = body.verified_at;
    if (body.verifier_id !== undefined)
      updatePayload.verifier_id = body.verifier_id;

    const { data: certification, error } = await supabase
      .from("oem_certifications")
      .update(updatePayload)
      .eq("certification_id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, certification });
  } catch (error) {
    console.error("Update certification error:", error);
    return NextResponse.json(
      { error: "Failed to update certification" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15: params is a Promise and must be awaited
    const { id } = await params;

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership by finding the certification and checking organization owner
    const { data: existing } = await supabase
      .from("oem_certifications")
      .select("*")
      .eq("certification_id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: orgForExisting, error: orgForExistingErr } = await supabase
      .from("organizations")
      .select("owner_id")
      .eq("id", existing.oem_org_id)
      .single();

    if (orgForExistingErr) {
      return NextResponse.json(
        { error: orgForExistingErr.message },
        { status: 500 }
      );
    }

    if (orgForExisting.owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete certification
    const { error } = await supabase
      .from("oem_certifications")
      .delete()
      .eq("certification_id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete certification error:", error);
    return NextResponse.json(
      { error: "Failed to delete certification" },
      { status: 500 }
    );
  }
}
