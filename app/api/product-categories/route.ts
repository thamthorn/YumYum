import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(request.url);
  const industry = searchParams.get("industry");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  try {
    // Build query to fetch distinct categories from products table with pricing
    let query = supabase
      .from("products")
      .select("category, product_pricing(unit_price)")
      .eq("is_active", true)
      .not("category", "is", null);

    // Filter by industry if provided
    if (industry && industry !== "Other") {
      query = query.eq("industry", industry);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error("Error fetching product categories:", error);
      return NextResponse.json(
        { error: { message: "Failed to fetch product categories" } },
        { status: 500 }
      );
    }

    // Filter products by price range if provided
    let filteredProducts = products || [];
    if (minPrice || maxPrice) {
      filteredProducts = filteredProducts.filter((product: any) => {
        // product typing is inferred from the Supabase query; avoid repeating a stricter inline type
        const pricing = product.product_pricing;
        if (!pricing || pricing.length === 0) return false;

        // Get the minimum price from all pricing tiers
        const productMinPrice = Math.min(
          ...pricing.map((p: { unit_price: string | number }) =>
            Number(p.unit_price)
          )
        );

        // Check if product's minimum price falls within the range
        if (minPrice && productMinPrice < Number(minPrice)) return false;
        if (maxPrice && productMinPrice > Number(maxPrice)) return false;

        return true;
      });
    }

    // Extract unique categories and sort alphabetically
    const uniqueCategories = Array.from(
      new Set(
        filteredProducts
          ?.map((p: any) => p.category)
          .filter((cat: any): cat is string => typeof cat === "string" && cat.length > 0)
      )
    ).sort();

    return NextResponse.json({
      data: uniqueCategories,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: { message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
