"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { WizardLayout } from "../WizardLayout";

// Local UI form type for capabilities step. This maps to the DB-shaped
// `CapabilitiesFormData` defined in `types/platform.ts` when saving/loading.
interface CapabilitiesUI {
  hasRnD: boolean;
  rndDescription: string;
  hasPackagingDesign: boolean;
  packagingDescription: string;
  hasFormulaLibrary: boolean;
  formulaCount: number | null;
  hasWhiteLabel: boolean;
  whiteLabelDescription: string;
  canExport: boolean;
  exportCountries: string;
}

export default function CapabilitiesStep() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [oemId, setOemId] = useState<string>("");
  const [capabilities, setCapabilities] = useState<CapabilitiesUI>({
    hasRnD: false,
    rndDescription: "",
    hasPackagingDesign: false,
    packagingDescription: "",
    hasFormulaLibrary: false,
    formulaCount: null,
    hasWhiteLabel: false,
    whiteLabelDescription: "",
    canExport: false,
    exportCountries: "",
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

      // Get Organization ID
      const { data: org } = await supabase
        .from("organizations")
        .select("id")
        .eq("owner_id", user.id)
        .eq("type", "oem")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      // When Supabase response types are not inferred, `org` can be typed as
      // `never` by TypeScript. Coerce to `any` and extract a stable `orgId`.
      const orgId = (org as any)?.id as string | undefined;
      if (!orgId) {
        router.push("/onboarding/oem/setup/products");
        return;
      }
      setOemId(orgId);

      // Load existing capabilities
      const { data: existing } = await supabase
        .from("oem_capabilities")
        .select("*")
        .eq("oem_org_id", orgId)
        .single();

      if (existing) {
        const ex: any = existing;
        setCapabilities({
          hasRnD: !!ex.has_rd,
          rndDescription: ex.rnd_description ?? "",
          hasPackagingDesign: !!ex.has_packaging,
          packagingDescription: ex.packaging_description ?? "",
          hasFormulaLibrary: !!ex.has_formula_library,
          formulaCount: ex.formula_count ?? null,
          hasWhiteLabel: !!ex.has_white_label,
          whiteLabelDescription: ex.white_label_description ?? "",
          canExport: !!ex.has_export_experience,
          exportCountries: ex.export_countries ?? "",
        });
      }
    } catch (error) {
      console.error("Error loading capabilities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();

      const record = {
        oem_org_id: oemId,
        has_rd: capabilities.hasRnD,
        has_packaging: capabilities.hasPackagingDesign,
        has_formula_library: capabilities.hasFormulaLibrary,
        has_white_label: capabilities.hasWhiteLabel,
        has_export_experience: capabilities.canExport,
      };

      const { error } = await (supabase as any)
        .from("oem_capabilities")
        .upsert(record);

      if (error) throw error;

      router.push("/onboarding/oem/setup/categories");
    } catch (error) {
      console.error("Error saving capabilities:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push("/onboarding/oem/setup/products");
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
    <WizardLayout currentStep="capabilities" completedSteps={["products"]}>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Manufacturing Capabilities
          </h2>
          <p className="mt-2 text-gray-600">
            Tell buyers about your value-added services and capabilities
          </p>
        </div>

        <div className="space-y-6">
          {/* R&D Support */}
          <div className="rounded-lg border p-6">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={capabilities.hasRnD}
                onChange={(e) =>
                  setCapabilities({ ...capabilities, hasRnD: e.target.checked })
                }
                className="mt-1 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">
                  R&D Support (Product Development)
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  We can help develop custom formulas and products
                </p>

                {capabilities.hasRnD && (
                  <textarea
                    value={capabilities.rndDescription}
                    onChange={(e) =>
                      setCapabilities({
                        ...capabilities,
                        rndDescription: e.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Describe your R&D capabilities and process..."
                    className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  />
                )}
              </div>
            </label>
          </div>

          {/* Packaging Design */}
          <div className="rounded-lg border p-6">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={capabilities.hasPackagingDesign}
                onChange={(e) =>
                  setCapabilities({
                    ...capabilities,
                    hasPackagingDesign: e.target.checked,
                  })
                }
                className="mt-1 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">
                  Packaging Design Services
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  We offer packaging design and printing services
                </p>

                {capabilities.hasPackagingDesign && (
                  <textarea
                    value={capabilities.packagingDescription}
                    onChange={(e) =>
                      setCapabilities({
                        ...capabilities,
                        packagingDescription: e.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Describe packaging options (materials, printing capabilities, etc.)..."
                    className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  />
                )}
              </div>
            </label>
          </div>

          {/* Formula Library */}
          <div className="rounded-lg border p-6">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={capabilities.hasFormulaLibrary}
                onChange={(e) =>
                  setCapabilities({
                    ...capabilities,
                    hasFormulaLibrary: e.target.checked,
                  })
                }
                className="mt-1 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">
                  Ready-to-Use Formula Library
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  We have pre-developed formulas that buyers can choose from
                </p>

                {capabilities.hasFormulaLibrary && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Number of Formulas
                    </label>
                    <input
                      type="number"
                      value={capabilities.formulaCount || ""}
                      onChange={(e) =>
                        setCapabilities({
                          ...capabilities,
                          formulaCount: parseInt(e.target.value) || null,
                        })
                      }
                      placeholder="e.g., 50"
                      className="mt-1 w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                    />
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* White Label */}
          <div className="rounded-lg border p-6">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={capabilities.hasWhiteLabel}
                onChange={(e) =>
                  setCapabilities({
                    ...capabilities,
                    hasWhiteLabel: e.target.checked,
                  })
                }
                className="mt-1 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">
                  White Label Manufacturing
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  We produce products under the buyer&apos;s brand name
                </p>

                {capabilities.hasWhiteLabel && (
                  <textarea
                    value={capabilities.whiteLabelDescription}
                    onChange={(e) =>
                      setCapabilities({
                        ...capabilities,
                        whiteLabelDescription: e.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Describe your white label services and minimum requirements..."
                    className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  />
                )}
              </div>
            </label>
          </div>

          {/* Export */}
          <div className="rounded-lg border p-6">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={capabilities.canExport}
                onChange={(e) =>
                  setCapabilities({
                    ...capabilities,
                    canExport: e.target.checked,
                  })
                }
                className="mt-1 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">
                  Export Capabilities
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  We can ship products internationally
                </p>

                {capabilities.canExport && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Countries/Regions
                    </label>
                    <input
                      type="text"
                      value={capabilities.exportCountries}
                      onChange={(e) =>
                        setCapabilities({
                          ...capabilities,
                          exportCountries: e.target.value,
                        })
                      }
                      placeholder="e.g., USA, EU, ASEAN, China, Japan"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                    />
                  </div>
                )}
              </div>
            </label>
          </div>
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
            {saving ? "Saving..." : "Next: Categories & MOQ"}
          </button>
        </div>
      </div>
    </WizardLayout>
  );
}
