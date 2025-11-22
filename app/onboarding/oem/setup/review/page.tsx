"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { WizardLayout } from "../WizardLayout";
import { CompletenessIndicator } from "@/components/ProgressIndicator";

interface ProfileSummary {
  companyName: string;
  productCount: number;
  categories: string[];
  certificationCount: number;
  hasCapabilities: boolean;
  completeness: number;
}

export default function ReviewStep() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [oemId, setOemId] = useState<string>("");
  const [summary, setSummary] = useState<ProfileSummary>({
    companyName: "",
    productCount: 0,
    categories: [],
    certificationCount: 0,
    hasCapabilities: false,
    completeness: 0,
  });

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const supabase = createSupabaseBrowserClient() as any;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get Organization
      const { data: org } = await supabase
        .from("organizations")
        .select("*")
        .eq("owner_id", user.id)
        .eq("type", "oem")
        .single();

      if (!org) return;

      // Coerce to any to avoid TS `never` when Supabase result types aren't inferred
      const orgId = (org as any)?.id as string | undefined;
      const orgAny: any = org;
      if (!orgId) return;
      setOemId(orgId);

      // Get products
      const { data: products } = await supabase
        .from("products")
        .select("id, category")
        .eq("oem_org_id", orgId);

      // Get certifications
      const { data: certs } = await supabase
        .from("oem_certifications")
        .select("certification_id")
        .eq("oem_org_id", orgId);

      // Get capabilities
      const { data: capabilities } = await supabase
        .from("oem_capabilities")
        .select("*")
        .eq("oem_org_id", orgId)
        .single();

      // Extract categories from products
      const productsAny: any[] = products || [];
      const categories = Array.from(
        new Set(productsAny.map((p) => p.category) || [])
      );

      // Calculate completeness
      let score = 0;
      if (orgAny.display_name && orgAny.display_name !== "My Factory")
        score += 20;
      if (products && products.length > 0) score += 30;
      if (categories.length > 0) score += 20;
      if (certs && certs.length > 0) score += 15;
      if (capabilities) score += 15;

      setSummary({
        companyName: orgAny.display_name || "YumYum OEM",
        productCount: products?.length || 0,
        categories,
        certificationCount: certs?.length || 0,
        hasCapabilities: !!capabilities,
        completeness: score,
      });
    } catch (error) {
      console.error("Error loading summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient() as any;

      // Check if profile meets minimum requirements for ACTIVE status
      const { data: isComplete } = await supabase.rpc(
        "check_oem_profile_completeness",
        { org_id: oemId }
      );

      // Set status based on completeness
      // If complete, set to ACTIVE (will show in OEM list)
      // Otherwise, set to INCOMPLETE
      const newStatus = isComplete ? "ACTIVE" : "INCOMPLETE";

      const { error: updateError } = await supabase
        .from("oem_profiles")
        .update({
          profile_status: newStatus,
        })
        .eq("organization_id", oemId);

      if (updateError) {
        throw updateError;
      }

      // Redirect to dashboard
      router.push("/dashboard/oem?setup=complete");
    } catch (error) {
      console.error("Error submitting profile:", error);
      alert("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push("/onboarding/oem/setup/certifications");
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
      currentStep="review"
      completedSteps={[
        "products",
        "capabilities",
        "categories",
        "certifications",
      ]}
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>
          <p className="mt-2 text-gray-600">
            Review your profile before submitting for approval
          </p>
        </div>

        {/* Completeness Score */}
        <div className="flex justify-center">
          <CompletenessIndicator
            percentage={summary.completeness}
            label="Profile Completeness"
            size="lg"
          />
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Company Info */}
          <div className="rounded-lg border bg-gray-50 p-6">
            <h3 className="flex items-center gap-2 font-semibold text-gray-900">
              <svg
                className="h-5 w-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                  clipRule="evenodd"
                />
              </svg>
              Company Information
            </h3>
            <p className="mt-2 text-lg font-medium text-gray-900">
              {summary.companyName}
            </p>
          </div>

          {/* Products */}
          <div className="rounded-lg border bg-gray-50 p-6">
            <h3 className="flex items-center gap-2 font-semibold text-gray-900">
              <svg
                className="h-5 w-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              Products
            </h3>
            <p className="mt-2 text-lg font-medium text-gray-900">
              {summary.productCount} product
              {summary.productCount !== 1 ? "s" : ""} added
            </p>
            {summary.productCount === 0 && (
              <p className="mt-1 text-sm text-red-600">
                ⚠️ At least 1 product required
              </p>
            )}
          </div>

          {/* Categories */}
          <div className="rounded-lg border bg-gray-50 p-6">
            <h3 className="flex items-center gap-2 font-semibold text-gray-900">
              <svg
                className="h-5 w-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              Categories
            </h3>
            <p className="mt-2 text-lg font-medium text-gray-900">
              {summary.categories.length} categor
              {summary.categories.length !== 1 ? "ies" : "y"}
            </p>
            {summary.categories.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {summary.categories.slice(0, 3).map((cat) => (
                  <span
                    key={cat}
                    className="rounded-md bg-green-100 px-2 py-0.5 text-xs text-green-700"
                  >
                    {cat}
                  </span>
                ))}
                {summary.categories.length > 3 && (
                  <span className="rounded-md bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
                    +{summary.categories.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Certifications */}
          <div className="rounded-lg border bg-gray-50 p-6">
            <h3 className="flex items-center gap-2 font-semibold text-gray-900">
              <svg
                className="h-5 w-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Certifications
            </h3>
            <p className="mt-2 text-lg font-medium text-gray-900">
              {summary.certificationCount} certification
              {summary.certificationCount !== 1 ? "s" : ""}
            </p>
            {summary.certificationCount === 0 && (
              <p className="mt-1 text-sm text-gray-600">
                Optional but recommended
              </p>
            )}
          </div>
        </div>

        {/* Capabilities Badge */}
        {summary.hasCapabilities && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2 text-green-800">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">
                Value-added capabilities configured
              </span>
            </div>
          </div>
        )}

        {/* Status Info */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h3 className="font-semibold text-blue-900">What happens next?</h3>
          <ul className="mt-3 space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0">✓</span>
              <span>
                Your profile will be reviewed by our team (usually within 24
                hours)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0">✓</span>
              <span>Once approved, your profile will be visible to buyers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0">✓</span>
              <span>
                You can edit your profile and add more products anytime
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0">✓</span>
              <span>
                Upgrade to Insights (฿2,999/mo) to view analytics and contact
                buyers
              </span>
            </li>
          </ul>
        </div>

        {/* Warning if incomplete */}
        {summary.productCount === 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 shrink-0 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm text-red-800">
                <p className="font-medium">Profile incomplete</p>
                <p className="mt-1 text-red-700">
                  You need to add at least 1 product before submitting your
                  profile.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || summary.productCount === 0}
            className="rounded-lg bg-green-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Profile for Review"}
          </button>
        </div>
      </div>
    </WizardLayout>
  );
}
