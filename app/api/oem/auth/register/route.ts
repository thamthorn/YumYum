import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Helper to generate slug from company name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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

    // Check if user already has an OEM organization
    const { data: existingOrg } = await supabase
      .from("organizations")
      .select("id")
      .eq("owner_id", user.id)
      .eq("type", "oem")
      .maybeSingle();

    // Explicitly type existingOrg as { id: string } | null
    const org: { id: string } | null = existingOrg as { id: string } | null;

    if (org) {
      // Check if OEM profile exists
      if (typeof org.id === "string") {
        const { data: existingProfile } = await supabase
          .from("oem_profiles")
          .select("organization_id")
          .eq("organization_id", org.id)
          .maybeSingle();
        if (existingProfile) {
          return NextResponse.json(
            { error: "OEM profile already exists" },
            { status: 400 }
          );
        }
      }
    }

    // Generate slug from company name
    const slug = generateSlug(body.company_name_en || body.company_name_th);

    // Create organization first
    const { data: createdOrg, error: orgError } = await supabase
      .from("organizations")
      .insert([
        {
          slug: slug,
          type: "oem",
          display_name: body.company_name_en || body.company_name_th,
          website: body.website || null,
          location: body.address || null,
          country_code: body.country || null,
          owner_id: user.id,
        },
      ])
      .select()
      .single();

    if (orgError) {
      console.error("Organization creation error:", orgError);
      // If slug conflict, try with timestamp
      if (orgError.code === "23505") {
        const uniqueSlug = `${slug}-${Date.now()}`;
        const { data: retryOrg, error: retryError } = await supabase
          .from("organizations")
          .insert([
            {
              slug: uniqueSlug,
              type: "oem",
              display_name: body.company_name_en || body.company_name_th,
              website: body.website || null,
              location: body.address || null,
              country_code: body.country || null,
              owner_id: user.id,
            },
          ])
          .select()
          .single();

        if (retryError) throw retryError;

        // Use retryOrg for profile creation
        const { data: profile, error: profileError } = await supabase
          .from("oem_profiles")
          .insert([
            {
              organization_id: retryOrg.id,
              company_name_th: body.company_name_th || null,
              contact_person: body.contact_person || null,
              contact_email: body.contact_email || null,
              contact_phone: body.contact_phone || null,
              line_id: body.line_id || null,
              wechat_id: body.wechat_id || null,
              profile_status: "REGISTERED",
            },
          ])
          .select()
          .single();

        if (profileError) throw profileError;

        // Create free subscription by default
        const { error: subError } = await supabase
          .from("subscriptions")
          .insert([
            {
              oem_org_id: retryOrg.id,
              tier: "FREE",
              status: "ACTIVE",
            },
          ]);

        if (subError) console.error("Failed to create subscription:", subError);

        return NextResponse.json({
          success: true,
          profileId: profile.organization_id,
          organizationId: retryOrg.id,
        });
      }
      throw orgError;
    }

    // Create OEM profile
    const { data: profile, error: profileError } = await supabase
      .from("oem_profiles")
      .insert([
        {
          organization_id: createdOrg.id,
          company_name_th: body.company_name_th || null,
          contact_person: body.contact_person || null,
          contact_email: body.contact_email || null,
          contact_phone: body.contact_phone || null,
          line_id: body.line_id || null,
          wechat_id: body.wechat_id || null,
          profile_status: "REGISTERED",
        },
      ])
      .select()
      .single();

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Clean up organization if profile creation fails
      if (createdOrg?.id) {
        await supabase.from("organizations").delete().eq("id", createdOrg.id);
      }
      throw profileError;
    }

    // Create free subscription by default
    const { error: subError } = await supabase.from("subscriptions").insert([
      {
        oem_org_id: createdOrg.id,
        tier: "FREE",
        status: "ACTIVE",
      },
    ]);

    if (subError) {
      console.error("Failed to create subscription:", subError);
      // Don't fail the request if subscription creation fails
    }

    return NextResponse.json({
      success: true,
      profileId: profile.organization_id,
      organizationId: createdOrg.id,
    });
  } catch (error: any) {
    console.error("OEM registration error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to register OEM profile",
        details: error.details || null,
      },
      { status: 500 }
    );
  }
}
