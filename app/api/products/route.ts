import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(request.url);
  const oemOrgId = searchParams.get("oem_org_id");

  if (!oemOrgId) {
    return NextResponse.json(
      { error: { message: "oem_org_id is required" } },
      { status: 400 }
    );
  }

  try {
    // Fetch products with pricing tiers and images
    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        *,
        product_pricing (
          min_quantity,
          max_quantity,
          unit_price,
          currency
        ),
        product_images (
          image_url,
          alt_text,
          is_primary,
          display_order
        )
      `
      )
      .eq("oem_org_id", oemOrgId)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching products:", error);
      return NextResponse.json(
        { error: { message: "Failed to fetch products" } },
        { status: 500 }
      );
    }

    // Sort pricing tiers by min_quantity (TypeScript workaround)
    const productsWithSortedPricing = (
      products as Array<{
        product_pricing?: Array<{
          min_quantity: number;
          [key: string]: unknown;
        }>;
        product_images?: Array<{
          display_order: number;
          [key: string]: unknown;
        }>;
        [key: string]: unknown;
      }>
    )?.map((product: any) => {
      const pricing = Array.isArray(product.product_pricing)
        ? [...product.product_pricing].sort(
            (a, b) => a.min_quantity - b.min_quantity
          )
        : product.product_pricing;

      const images = Array.isArray(product.product_images)
        ? [...product.product_images].sort(
            (a, b) => a.display_order - b.display_order
          )
        : product.product_images;

      return {
        ...product,
        product_pricing: pricing,
        product_images: images,
      };
    });

    return NextResponse.json({
      data: productsWithSortedPricing || [],
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: { message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
