"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { WizardLayout } from "../WizardLayout";
// Local UI form type for the categories/MOQ step. The DB uses snake_case
// fields (e.g., `moq_beverages`) defined in `types/platform.ts`. Keep a
// separate UI type with camelCase keys for component state.
interface CategoriesUI {
  categories: string[];
  beveragesMOQ: number | null;
  snacksMOQ: number | null;
  saucesCondimentsMOQ: number | null;
  supplementsMOQ: number | null;
  bakeryMOQ: number | null;
  dairyAlternativesMOQ: number | null;
  readyToEatMOQ: number | null;
  dessertsMOQ: number | null;
  healthFoodsMOQ: number | null;
  petFoodMOQ: number | null;
}

const FOOD_CATEGORIES = [
  "Beverages",
  "Snacks",
  "Sauces & Condiments",
  "Supplements",
  "Bakery",
  "Dairy & Alternatives",
  "Ready-to-Eat",
  "Desserts",
  "Health Foods",
  "Pet Food",
];

export default function CategoriesStep() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [oemId, setOemId] = useState<string>("");
  const [moqData, setMOQData] = useState<CategoriesUI>({
    categories: [],
    beveragesMOQ: null,
    snacksMOQ: null,
    saucesCondimentsMOQ: null,
    supplementsMOQ: null,
    bakeryMOQ: null,
    dairyAlternativesMOQ: null,
    readyToEatMOQ: null,
    dessertsMOQ: null,
    healthFoodsMOQ: null,
    petFoodMOQ: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get Organization
      const { data: org } = await supabase
        .from("organizations")
        .select("id")
        .eq("owner_id", user.id)
        .eq("type", "oem")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      // Supabase result may not have inferred types; coerce to `any` and
      // extract a stable `orgId` to avoid TS `never` errors when accessing
      // `org.id`.
      const orgId = (org as any)?.id as string | undefined;
      if (!orgId) {
        router.push("/onboarding/oem/setup/products");
        return;
      }
      setOemId(orgId);

      const { data: profile } = await supabase
        .from("oem_profiles")
        .select("*")
        .eq("organization_id", orgId)
        .single();

      // Map existing MOQ fields. Cast `profile` to any because Supabase
      // result types may not be inferred and TS can treat it as `never`.
      const prof: any = profile;
      if (prof) {
        const activeCategories: string[] = [];
        if (prof.moq_beverages) activeCategories.push("Beverages");
        if (prof.moq_snacks) activeCategories.push("Snacks");
        if (prof.moq_sauces_condiments)
          activeCategories.push("Sauces & Condiments");
        if (prof.moq_supplements) activeCategories.push("Supplements");
        if (prof.moq_bakery) activeCategories.push("Bakery");
        if (prof.moq_dairy_alternatives)
          activeCategories.push("Dairy & Alternatives");
        if (prof.moq_ready_to_eat) activeCategories.push("Ready-to-Eat");
        if (prof.moq_desserts) activeCategories.push("Desserts");
        if (prof.moq_health_foods) activeCategories.push("Health Foods");
        if (prof.moq_pet_food) activeCategories.push("Pet Food");

        setMOQData({
          categories: activeCategories,
          beveragesMOQ: prof.moq_beverages || null,
          snacksMOQ: prof.moq_snacks || null,
          saucesCondimentsMOQ: prof.moq_sauces_condiments || null,
          supplementsMOQ: prof.moq_supplements || null,
          bakeryMOQ: prof.moq_bakery || null,
          dairyAlternativesMOQ: prof.moq_dairy_alternatives || null,
          readyToEatMOQ: prof.moq_ready_to_eat || null,
          dessertsMOQ: prof.moq_desserts || null,
          healthFoodsMOQ: prof.moq_health_foods || null,
          petFoodMOQ: prof.moq_pet_food || null,
        });
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    const isSelected = moqData.categories.includes(category);
    if (isSelected) {
      // Remove category and clear its MOQ
      setMOQData({
        ...moqData,
        categories: moqData.categories.filter((c) => c !== category),
        [`${getCategoryKey(category)}MOQ`]: null,
      } as unknown as CategoriesUI);
    } else {
      // Add category
      setMOQData({
        ...moqData,
        categories: [...moqData.categories, category],
      });
    }
  };

  const getCategoryKey = (category: string): string => {
    return category.toLowerCase().replace(/\s+/g, "").replace(/&/g, "");
  };

  const updateMOQ = (category: string, value: number | null) => {
    const key = `${getCategoryKey(category)}MOQ` as keyof CategoriesUI;
    setMOQData({
      ...moqData,
      [key]: value,
    } as unknown as CategoriesUI);
  };

  const handleNext = async () => {
    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();

      // Validate at least one category
      const selectedCategories = FOOD_CATEGORIES.filter((cat) => {
        const key = `${getCategoryKey(cat)}MOQ` as keyof CategoriesUI;
        return (moqData as any)[key] !== null;
      });

      if (selectedCategories.length === 0) {
        alert("Please select at least one category and set its MOQ");
        setSaving(false);
        return;
      }

      // Only save fields that exist in the database
      const updates: any = {
        moq_beverages: moqData.beveragesMOQ,
        moq_snacks: moqData.snacksMOQ,
        moq_sauces_condiments: moqData.saucesCondimentsMOQ,
        moq_supplements: moqData.supplementsMOQ,
        moq_bakery: moqData.bakeryMOQ,
        moq_dairy_alternatives: moqData.dairyAlternativesMOQ,
        moq_ready_to_eat: moqData.readyToEatMOQ,
        moq_desserts: moqData.dessertsMOQ,
        moq_health_foods: moqData.healthFoodsMOQ,
        moq_pet_food: moqData.petFoodMOQ,
      };

      // Calculate min/max MOQ from all selected categories to save to profile summary
      const allMoqs = Object.entries(moqData)
        .filter(([, value]) => typeof value === "number" && value !== null)
        .map(([, value]) => value as number);

      if (allMoqs.length > 0) {
        updates.moq_min = Math.min(...allMoqs);
        updates.moq_max = Math.max(...allMoqs);
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await (supabase as any)
          .from("oem_profiles")
          .update(updates)
          .eq("organization_id", oemId);

        if (error) throw error;
      }

      router.push("/onboarding/oem/setup/certifications");
    } catch (error) {
      console.error("Error saving categories:", error);
      alert("Failed to save categories. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push("/onboarding/oem/setup/capabilities");
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
      currentStep="categories"
      completedSteps={["products", "capabilities"]}
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Product Categories & MOQ
          </h2>
          <p className="mt-2 text-gray-600">
            Select categories you manufacture and set MOQ for each
          </p>
        </div>

        <div className="space-y-4">
          {FOOD_CATEGORIES.map((category) => {
            const key = `${getCategoryKey(category)}MOQ` as keyof CategoriesUI;
            const moqValue = moqData[key] as number | null;
            const isActive = moqData.categories.includes(category);

            return (
              <div
                key={category}
                className={`rounded-lg border p-6 transition-all ${
                  isActive ? "border-green-500 bg-green-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => toggleCategory(category)}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">
                        {category}
                      </h3>
                      {isActive && (
                        <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                          Active
                        </span>
                      )}
                    </div>

                    {isActive && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Minimum Order Quantity (units)
                        </label>
                        <input
                          type="number"
                          value={moqValue || ""}
                          onChange={(e) =>
                            updateMOQ(
                              category,
                              parseInt(e.target.value) || null
                            )
                          }
                          placeholder="e.g., 1000"
                          className="mt-1 w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={saving}
            className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Next: Certifications"}
          </button>
        </div>
      </div>
    </WizardLayout>
  );
}
