"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import type { ProgressStep } from "@/components/ProgressIndicator";

const WIZARD_STEPS: ProgressStep[] = [
  { id: "products", label: "Products", completed: false },
  { id: "capabilities", label: "Capabilities", completed: false },
  { id: "categories", label: "Categories & MOQ", completed: false },
  { id: "certifications", label: "Certifications", completed: false },
  { id: "review", label: "Review", completed: false },
];

interface WizardLayoutProps {
  children: React.ReactNode;
  currentStep: string;
  completedSteps?: string[];
  onSaveDraft?: () => Promise<void>;
  isSaving?: boolean;
}

export function WizardLayout({
  children,
  currentStep,
  completedSteps = [],
  onSaveDraft,
  isSaving = false,
}: WizardLayoutProps) {
  const router = useRouter();
  const [oemProfile, setOEMProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOEMProfile();
  }, []);

  const loadOEMProfile = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Just set user as authenticated, don't check for profile
      // Profile will be created during onboarding
      setOEMProfile({ user_id: user.id });
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  };

  const stepsWithCompletion = WIZARD_STEPS.map((step) => ({
    ...step,
    completed: completedSteps.includes(step.id),
  }));

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Complete Your OEM Profile
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {oemProfile?.company_name || "YumYum OEM Setup"}
              </p>
            </div>
            {onSaveDraft && (
              <button
                onClick={onSaveDraft}
                disabled={isSaving}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Draft"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <ProgressIndicator
            steps={stepsWithCompletion}
            currentStepId={currentStep}
          />
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="rounded-xl border bg-white p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
