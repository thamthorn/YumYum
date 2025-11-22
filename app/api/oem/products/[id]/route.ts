import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // FIX: Await params first
    const { id } = await params;

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: product, error } = await supabase
      .from("products")
      .select(
        `
        *,
        product_images(*),
        oem_profiles!inner(organization_id)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Verify ownership: check organization's owner_id
    if (!product || !product.oem_profiles?.organization_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: orgForProduct } = await supabase
      .from("organizations")
      .select("owner_id")
      .eq("id", product.oem_profiles.organization_id)
      .single();

    if (!orgForProduct || orgForProduct.owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // FIX: Await params first
    const { id } = await params;

    const supabase = await createSupabaseServerClient();
    const body = await request.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from("products")
      .select("oem_profiles!inner(organization_id)")
      .eq("id", id)
      .single();

    if (!existing || !existing.oem_profiles?.organization_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: orgForExisting } = await supabase
      .from("organizations")
      .select("owner_id")
      .eq("id", existing.oem_profiles.organization_id)
      .single();

    if (!orgForExisting || orgForExisting.owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update product
    const { data: product, error } = await supabase
      .from("products")
      .update({
        product_name: body.productName,
        product_name_th: body.productNameTH,
        category: body.category,
        description: body.description,
        ingredients: body.ingredients,
        shelf_life: body.shelfLife,
        storage_conditions: body.storageConditions,
        packaging_options: body.packagingOptions,
        price_range_min: body.priceRangeMin,
        price_range_max: body.priceRangeMax,
        moq: body.moq,
        lead_time_days: body.leadTimeDays,
      })
      .eq("id", id) // FIX: Use resolved id
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update images if provided
    if (body.images) {
      // Delete existing images
      await supabase.from("product_images").delete().eq("product_id", id); // FIX: Use resolved id

      // Insert new images
      if (body.images.length > 0) {
        const imageRecords = body.images.map((img: any, index: number) => ({
          product_id: id, // FIX: Use resolved id (previously params.id)
          image_url: img.url,
          display_order: index + 1,
        }));

        await supabase.from("product_images").insert(imageRecords);
      }
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // FIX: Await params first
    const { id } = await params;

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from("products")
      .select("oem_profiles!inner(organization_id)")
      .eq("id", id)
      .single();

    if (!existing || !existing.oem_profiles?.organization_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: orgForDelete } = await supabase
      .from("organizations")
      .select("owner_id")
      .eq("id", existing.oem_profiles.organization_id)
      .single();

    if (!orgForDelete || orgForDelete.owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete product (cascade will delete images)
    const { error } = await supabase.from("products").delete().eq("id", id); // FIX: Use resolved id

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
