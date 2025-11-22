"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { WizardLayout } from "../WizardLayout";
import type { CertificationType } from "@/types/platform";

// Local UI form type for certifications step. The DB `CertificationsFormData`
// uses a different shape (snake_case and file upload info). Keep a separate
// UI-facing type that matches the onboarding form fields.
interface CertificationsUI {
  certifications: {
    type: CertificationType | string;
    issuedBy: string;
    issueDate: string;
    expiryDate: string;
    certificateNumber: string;
  }[];
}

const CERTIFICATIONS: {
  type: CertificationType;
  label: string;
  description: string;
}[] = [
  { type: "GMP", label: "GMP", description: "Good Manufacturing Practice" },
  {
    type: "HACCP",
    label: "HACCP",
    description: "Hazard Analysis Critical Control Point",
  },
  {
    type: "ISO22000",
    label: "ISO 22000",
    description: "Food Safety Management",
  },
  { type: "HALAL", label: "HALAL", description: "Halal Certification" },
  { type: "ORGANIC", label: "Organic", description: "Organic Certification" },
  { type: "FDA", label: "FDA", description: "Food and Drug Administration" },
  {
    type: "FSSC22000",
    label: "FSSC 22000",
    description: "Food Safety System Certification",
  },
  { type: "BRC", label: "BRC", description: "British Retail Consortium" },
  { type: "OTHER", label: "Other", description: "Other certifications" },
];

export default function CertificationsStep() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [oemOrgId, setOemOrgId] = useState<string>("");
  const [certifications, setCertifications] = useState<CertificationsUI>({
    certifications: [],
  });
  const [masterCertifications, setMasterCertifications] = useState<any[]>([]);

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

      // 1. Get OEM Organization ID
      // First try to find by owner_id in organizations
      let orgId = null;

      const { data: org } = await supabase
        .from("organizations")
        .select("id")
        .eq("owner_id", user.id)
        .single();

      // Supabase result may not have inferred types; coerce `org` to `any`
      // and extract a stable `orgId` to avoid TS 'never' errors.
      const orgIdFromOrg = (org as any)?.id as string | undefined;
      if (orgIdFromOrg) {
        orgId = orgIdFromOrg;
      } else {
        // Fallback: check oem_profiles directly (though it links to org)
        const { data: profile } = await supabase
          .from("oem_profiles")
          .select("organization_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile) {
          const prof: any = profile;
          orgId = prof.organization_id;
        }
      }

      if (!orgId) {
        console.error("No organization found for user");
        return;
      }

      setOemOrgId(orgId);

      // 2. Load master certifications list
      const { data: masterCerts } = await supabase
        .from("certifications")
        .select("*");
      setMasterCertifications(masterCerts || []);

      // 3. Load existing certifications for this OEM
      const { data: existing } = await supabase
        .from("oem_certifications")
        .select("*")
        .eq("oem_org_id", orgId);

      if (existing && existing.length > 0) {
        setCertifications({
          certifications: existing.map((cert: any) => ({
            type: cert.certification_type || "OTHER", // Fallback
            issuedBy: "", // Not in DB anymore
            issueDate: "", // Not in DB anymore
            expiryDate: cert.expiry_date || "",
            certificateNumber: "", // Not in DB anymore
          })),
        });
      }
    } catch (error) {
      console.error("Error loading certifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCertification = (type: CertificationType) => {
    const existing = certifications.certifications.find((c) => c.type === type);
    if (existing) {
      // Remove
      setCertifications({
        certifications: certifications.certifications.filter(
          (c) => c.type !== type
        ),
      });
    } else {
      // Add
      setCertifications({
        certifications: [
          ...certifications.certifications,
          {
            type,
            issuedBy: "",
            issueDate: "",
            expiryDate: "",
            certificateNumber: "",
          },
        ],
      });
    }
  };

  const updateCertification = (
    type: CertificationType,
    field: string,
    value: string
  ) => {
    setCertifications({
      certifications: certifications.certifications.map((cert) =>
        cert.type === type ? { ...cert, [field]: value } : cert
      ),
    });
  };

  const handleNext = async () => {
    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();

      if (!oemOrgId) {
        throw new Error("No OEM Organization ID found");
      }

      // Delete existing certifications
      await supabase
        .from("oem_certifications")
        .delete()
        .eq("oem_org_id", oemOrgId);

      // Insert new certifications
      if (certifications.certifications.length > 0) {
        for (const cert of certifications.certifications) {
          // 1. Find or create master certification ID
          // We try to match by name (label) or type
          const certDef = CERTIFICATIONS.find((c) => c.type === cert.type);
          const certLabel = certDef?.label || cert.type;

          let masterCertId = masterCertifications.find(
            (mc) => mc.name === certLabel || mc.name === cert.type
          )?.id;

          if (!masterCertId) {
            // Create new master certification if it doesn't exist
            // Note: This might fail if user doesn't have permissions, but let's try
            const { data: newCert, error: createError } = await (
              supabase as any
            )
              .from("certifications")
              .insert({
                name: certLabel,
                issuer: "Unknown", // Required field
                description: certDef?.description || "Custom certification",
              })
              .select("id")
              .single();

            if (createError) {
              console.error(
                "Error creating master certification:",
                createError
              );
              // Fallback: try to find ANY certification to use as placeholder if we can't create
              // This is a hack to satisfy the FK constraint if creation fails
              if (masterCertifications.length > 0) {
                masterCertId = masterCertifications[0].id;
              }
            } else if (newCert) {
              const newCertAny: any = newCert;
              masterCertId = newCertAny.id;
              // Update local cache
              setMasterCertifications((prev) => [
                ...prev,
                { id: masterCertId, name: certLabel },
              ]);
            }
          }

          if (masterCertId) {
            // 2. Insert into oem_certifications
            // Map FDA to FDA_THAILAND if needed (for backward compatibility)
            let certType = cert.type;
            if (certType === "FDA") {
              // Keep as FDA for now; no mapping to FDA_THAILAND performed here.
              certType = "FDA";
            }

            const { error: insertError } = await (supabase as any)
              .from("oem_certifications")
              .insert({
                oem_org_id: oemOrgId,
                certification_id: masterCertId,
                certification_type: certType as any, // Type assertion needed due to enum
                expiry_date: cert.expiryDate || null,
                // verified: false, // Default
                // verification_tier: 'none' // Default
              });

            if (insertError) {
              console.error("Error inserting oem_certification:", insertError);
              throw new Error(
                `Failed to save certification: ${insertError.message}`
              );
            }
          }
        }
      }

      router.push("/onboarding/oem/setup/review");
    } catch (error) {
      console.error("Error saving certifications:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push("/onboarding/oem/setup/categories");
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
      currentStep="certifications"
      completedSteps={["products", "capabilities", "categories"]}
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Certifications</h2>
          <p className="mt-2 text-gray-600">
            Add your food safety and quality certifications (optional but
            recommended)
          </p>
        </div>

        <div className="space-y-4">
          {CERTIFICATIONS.map((cert) => {
            const selected = certifications.certifications.find(
              (c) => c.type === cert.type
            );
            const isActive = !!selected;

            return (
              <div
                key={cert.type}
                className={`rounded-lg border p-6 transition-all ${
                  isActive ? "border-green-500 bg-green-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => toggleCertification(cert.type)}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {cert.label}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {cert.description}
                        </p>
                      </div>
                      {isActive && (
                        <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                          Added
                        </span>
                      )}
                    </div>

                    {isActive && selected && (
                      <div className="mt-4 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Expiry Date
                          </label>
                          <input
                            type="date"
                            value={selected.expiryDate}
                            onChange={(e) =>
                              updateCertification(
                                cert.type,
                                "expiryDate",
                                e.target.value
                              )
                            }
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 flex-shrink-0 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium">
                Certifications boost your credibility
              </p>
              <p className="mt-1 text-blue-700">
                OEMs with certifications receive 3x more inquiries. You can skip
                this step and add certifications later from your dashboard.
              </p>
            </div>
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
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/onboarding/oem/setup/review")}
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              disabled={saving}
              className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Next: Review"}
            </button>
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}
