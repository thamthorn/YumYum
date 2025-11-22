import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOEMIds } from "@/lib/supabase/oem-helpers";
import { NextResponse } from "next/server";

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

    // Get OEM IDs using helper function
    const { oemProfileId, error: oemError } = await getOEMIds(
      supabase,
      user.id
    );

    if (oemError || !oemProfileId) {
      return NextResponse.json(
        { error: "OEM profile not found" },
        { status: 404 }
      );
    }

    // Create product
    const { data: product, error } = await supabase
      .from("products")
      .insert({
        oem_org_id: oemProfileId,
        name: body.productName,
        // product_name_th: body.productNameTH, // Not in schema
        category: body.category,
        description: body.description,
        // ingredients: body.ingredients, // Not in schema
        // shelf_life: body.shelfLife, // Not in schema
        // storage_conditions: body.storageConditions, // Not in schema
        // packaging_options: body.packagingOptions, // Not in schema
        // price_range_min: body.priceRangeMin, // Not in schema
        // price_range_max: body.priceRangeMax, // Not in schema
        moq: body.moq,
        lead_time_days: body.leadTimeDays,
        specifications: {
          product_name_th: body.productNameTH,
          ingredients: body.ingredients,
          shelf_life: body.shelfLife,
          storage_conditions: body.storageConditions,
          packaging_options: body.packagingOptions,
          price_range_min: body.priceRangeMin,
          price_range_max: body.priceRangeMax,
        },
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add product images if provided
    if (body.images && body.images.length > 0) {
      const imageRecords = body.images.map((img: any, index: number) => ({
        product_id: product.id,
        image_url: img.url,
        display_order: index + 1,
      }));

      const { error: imgError } = await supabase
        .from("product_images")
        .insert(imageRecords);

      if (imgError) {
        console.error("Failed to insert images:", imgError);
      }
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get OEM IDs using helper function
    const { oemProfileId, error: oemError } = await getOEMIds(
      supabase,
      user.id
    );

    if (oemError || !oemProfileId) {
      return NextResponse.json(
        { error: "OEM profile not found" },
        { status: 404 }
      );
    }

    // Get products with images
    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        *,
        product_images(*)
      `
      )
      .eq("oem_org_id", oemProfileId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
