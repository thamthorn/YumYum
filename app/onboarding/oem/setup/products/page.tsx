"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { WizardLayout } from "../WizardLayout";
import { ProductImageUploader } from "@/components/ProductImageUploader";
// import type { ProductFormData } from "@/types/platform"; // Disable import to avoid type mismatch

// Define local interface to match the form state exactly
interface LocalProductFormData {
  id?: string;
  productName: string;
  productNameTH: string;
  category: string;
  description: string;
  ingredients: string;
  shelfLife: number | null;
  storageConditions: string;
  packagingOptions: string;
  priceRangeMin: number | null;
  priceRangeMax: number | null;
  moq: number | null;
  leadTimeDays: number | null;
  images: any[];
}

// ...existing code...
export default function ProductsStep() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [oemId, setOemId] = useState<string>("");
  const [products, setProducts] = useState<LocalProductFormData[]>([
    {
      productName: "",
      productNameTH: "",
      category: "",
      description: "",
      ingredients: "",
      shelfLife: null,
      storageConditions: "",
      packagingOptions: "",
      priceRangeMin: null,
      priceRangeMax: null,
      moq: null,
      leadTimeDays: null,
      images: [],
    },
  ]);

  useEffect(() => {
    loadDraft();
  }, []);

  const loadDraft = async () => {
    try {
      const supabase = createSupabaseBrowserClient() as any;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // 1. Get or Create Organization
      let { data: org } = await supabase
        .from("organizations")
        .select("id")
        .eq("owner_id", user.id)
        .eq("type", "oem")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!org) {
        // Create default organization if not exists
        const { data: newOrg, error: orgError } = await supabase
          .from("organizations")
          .insert({
            owner_id: user.id,
            type: "oem",
            display_name: "My Factory",
            slug: `oem-${Date.now()}`,
          })
          .select("id")
          .single();

        if (orgError) throw orgError;
        org = newOrg;
      }

      // Ensure oem_profile exists
      const { data: profile } = await supabase
        .from("oem_profiles")
        .select("organization_id")
        .eq("organization_id", org.id)
        .maybeSingle();

      if (!profile) {
        const { error: profileError } = await supabase
          .from("oem_profiles")
          .insert({
            organization_id: org.id,
            scale: "small",
          });

        if (profileError) {
          console.error("Error creating OEM profile:", profileError);
          // Don't throw here, let's see if we can proceed or if it fails later
        }
      }

      setOemId(org.id);

      // 3. Ensure user is a member of the organization
      // This is required for RLS policies to work correctly if they rely on organization_members table
      const { data: member } = await supabase
        .from("organization_members")
        .select("profile_id")
        .eq("organization_id", org.id)
        .eq("profile_id", user.id)
        .maybeSingle();

      if (!member) {
        // Try to add user as owner member
        // Note: This requires the RLS policy update to allow owners to insert members
        const { error: memberError } = await supabase
          .from("organization_members")
          .insert({
            organization_id: org.id,
            profile_id: user.id,
            role_in_org: "owner",
          });

        if (memberError) {
          console.warn(
            "Could not add user to organization_members:",
            memberError
          );
          // We continue anyway because the updated is_org_member function should handle owners
        }
      }

      // 4. Load Products
      const { data: existingProducts, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("oem_org_id", org.id);

      if (productsError) throw productsError;

      if (existingProducts && existingProducts.length > 0) {
        const mapped = await Promise.all(
          existingProducts.map(async (p: any) => {
            // Fetch images for this product
            const { data: productImages } = await supabase
              .from("product_images")
              .select("*")
              .eq("product_id", p.id)
              .order("display_order", { ascending: true });

            return {
              id: p.id,
              productName: p.name || "",
              productNameTH: p.specifications?.product_name_th || "",
              category: p.category || "",
              description: p.description || "",
              ingredients: p.specifications?.ingredients || "",
              shelfLife: p.specifications?.shelf_life || null,
              storageConditions: p.specifications?.storage_conditions || "",
              packagingOptions: p.specifications?.packaging_options || "",
              priceRangeMin:
                p.price_min || p.specifications?.price_range_min || null,
              priceRangeMax:
                p.price_max || p.specifications?.price_range_max || null,
              moq: p.moq,
              leadTimeDays: p.lead_time_days,
              images: productImages
                ? productImages.map((img: any) => ({
                    id: img.id,
                    url: img.image_url,
                    displayOrder: img.display_order,
                  }))
                : [],
            };
          })
        );
        setProducts(mapped);
      }
    } catch (error) {
      console.error("Error loading draft:", error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = () => {
    setProducts([
      ...products,
      {
        productName: "",
        productNameTH: "",
        category: "",
        description: "",
        ingredients: "",
        shelfLife: null,
        storageConditions: "",
        packagingOptions: "",
        priceRangeMin: null,
        priceRangeMax: null,
        moq: null,
        leadTimeDays: null,
        images: [],
      },
    ]);
  };

  const removeProduct = (index: number) => {
    if (products.length === 1) return; // Keep at least one
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (
    index: number,
    updates: Partial<LocalProductFormData>
  ) => {
    const updated = [...products];
    updated[index] = { ...updated[index], ...updates };
    setProducts(updated);
  };

  const saveDraft = async () => {
    // Auto-save implementation
    console.log("Auto-saving products draft...");
  };

  const handleNext = async () => {
    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient() as any;

      // Validate at least one product
      // Check if fields are filled (allow 0 for numbers if that makes sense, but usually MOQ > 0)
      const validProducts = products.filter(
        (p) =>
          p.productName?.trim() !== "" &&
          p.category !== "" &&
          p.moq !== null &&
          p.leadTimeDays !== null
      );

      if (validProducts.length === 0) {
        console.log("Validation failed. Products:", products);
        // Check the first product to give a hint
        const p = products[0];
        const missing = [];
        if (!p.productName?.trim()) missing.push("Product Name");
        if (!p.category) missing.push("Category");
        if (p.moq === null) missing.push("MOQ");
        if (p.leadTimeDays === null) missing.push("Lead Time");

        alert(
          `Please fill in all required fields for the product. Missing: ${missing.join(", ")}`
        );
        setSaving(false);
        return;
      }

      // Save products
      for (const product of validProducts) {
        const productData = {
          name: product.productName,
          category: product.category,
          description: product.description,
          moq: product.moq,
          lead_time_days: product.leadTimeDays,
          price_min: product.priceRangeMin,
          price_max: product.priceRangeMax,
          specifications: {
            product_name_th: product.productNameTH,
            ingredients: product.ingredients,
            shelf_life: product.shelfLife,
            storage_conditions: product.storageConditions,
            packaging_options: product.packagingOptions,
            price_range_min: product.priceRangeMin,
            price_range_max: product.priceRangeMax,
          },
        };

        let productId = product.id;

        if (productId) {
          // Update existing
          await supabase
            .from("products")
            .update(productData)
            .eq("id", productId);
        } else {
          // Create new
          const { data: newProduct, error } = await supabase
            .from("products")
            .insert({
              oem_org_id: oemId,
              ...productData,
            })
            .select()
            .single();

          if (error) throw error;
          productId = newProduct.id;
        }

        // Upload images if any
        if (productId && product.images.length > 0) {
          for (const image of product.images) {
            // If it has a file, it needs uploading
            if (image.file) {
              const fileExt = image.file.name.split(".").pop();
              const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
              const filePath = `${oemId}/${productId}/${fileName}`;

              // Upload to Supabase Storage
              // Using 'product-images' bucket. If it doesn't exist, this will fail.
              // Fallback to 'request-files' if needed or ensure bucket exists.
              const { error: uploadError } = await supabase.storage
                .from("product-images")
                .upload(filePath, image.file);

              if (uploadError) {
                console.error("Error uploading image:", uploadError);
                continue;
              }

              const {
                data: { publicUrl },
              } = supabase.storage
                .from("product-images")
                .getPublicUrl(filePath);

              // Save to product_images table
              await supabase.from("product_images").insert({
                product_id: productId,
                image_url: publicUrl,
                display_order: image.displayOrder,
                is_primary: image.displayOrder === 1,
                alt_text: product.productName,
              });
            } else if (image.id) {
              // Update display order for existing images
              await supabase
                .from("product_images")
                .update({
                  display_order: image.displayOrder,
                  is_primary: image.displayOrder === 1,
                })
                .eq("id", image.id);
            }
          }
        }
      }

      router.push("/onboarding/oem/setup/capabilities");
    } catch (error) {
      console.error("Error saving products:", error);
      alert("Failed to save products. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <WizardLayout
      currentStep="products"
      completedSteps={[]}
      onSaveDraft={saveDraft}
      isSaving={saving}
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Add Your Products
          </h2>
          <p className="mt-2 text-gray-600">
            List the products you manufacture. Add at least one product to
            continue.
          </p>
        </div>

        {products.map((product, index) => (
          <div key={index} className="rounded-lg border p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Product {index + 1}
              </h3>
              {products.length > 1 && (
                <button
                  onClick={() => removeProduct(index)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Product Name */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Product Name (English) *
                  </label>
                  <input
                    type="text"
                    value={product.productName}
                    onChange={(e) =>
                      updateProduct(index, { productName: e.target.value })
                    }
                    placeholder="e.g., Organic Green Tea"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    ชื่อผลิตภัณฑ์ (ไทย)
                  </label>
                  <input
                    type="text"
                    value={product.productNameTH || ""}
                    onChange={(e) =>
                      updateProduct(index, { productNameTH: e.target.value })
                    }
                    placeholder="เช่น ชาเขียวออร์แกนิก"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  aria-label="Product Category"
                  value={product.category}
                  onChange={(e) =>
                    updateProduct(index, { category: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                >
                  <option value="">Select category</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Sauces & Condiments">
                    Sauces & Condiments
                  </option>
                  <option value="Supplements">Supplements</option>
                  <option value="Cosmetics">Cosmetics</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={product.description || ""}
                  onChange={(e) =>
                    updateProduct(index, { description: e.target.value })
                  }
                  rows={3}
                  placeholder="Describe your product..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                />
              </div>

              {/* MOQ & Lead Time */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Minimum Order Quantity (MOQ) *
                  </label>
                  <input
                    type="number"
                    value={product.moq || ""}
                    onChange={(e) =>
                      updateProduct(index, {
                        moq: parseInt(e.target.value) || null,
                      })
                    }
                    placeholder="e.g., 1000"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Lead Time (days) *
                  </label>
                  <input
                    type="number"
                    value={product.leadTimeDays || ""}
                    onChange={(e) =>
                      updateProduct(index, {
                        leadTimeDays: parseInt(e.target.value) || null,
                      })
                    }
                    placeholder="e.g., 30"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Price Range Min (฿)
                  </label>
                  <input
                    type="number"
                    value={product.priceRangeMin || ""}
                    onChange={(e) =>
                      updateProduct(index, {
                        priceRangeMin: parseFloat(e.target.value) || null,
                      })
                    }
                    placeholder="e.g., 50"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Price Range Max (฿)
                  </label>
                  <input
                    type="number"
                    value={product.priceRangeMax || ""}
                    onChange={(e) =>
                      updateProduct(index, {
                        priceRangeMax: parseFloat(e.target.value) || null,
                      })
                    }
                    placeholder="e.g., 100"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  />
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Product Images
                </label>
                <ProductImageUploader
                  images={product.images}
                  onImagesChange={(images) => updateProduct(index, { images })}
                  maxImages={5}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Add Product Button */}
        <button
          onClick={addProduct}
          className="w-full rounded-lg border-2 border-dashed border-gray-300 py-4 text-gray-600 transition-colors hover:border-green-400 hover:text-green-600"
        >
          + Add Another Product
        </button>

        {/* Navigation */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleNext}
            disabled={saving}
            className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Next: Capabilities"}
          </button>
        </div>
      </div>
    </WizardLayout>
  );
}


