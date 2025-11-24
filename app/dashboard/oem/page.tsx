"use client";

import {useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import ProtectedClient from "@/components/ProtectedClient";
import { OEMFinancialStats } from "@/components/OEMFinancialStats";
import { TierBadge } from "@/components/TierBadge";
import { AnalyticsOverview } from "@/components/AnalyticsOverview";
import { CompletenessIndicator } from "@/components/ProgressIndicator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Settings,
  Package,
  Award,
  Crown,
  BarChart3,
} from "lucide-react";
import { ROUTES } from "@/data/MockData";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  OEMProfile,
  // ...existing code...
  SubscriptionTier,
} from "@/types/platform";

interface DashboardData {
  profile: OEMProfile & {
    tier?: SubscriptionTier;
    currentTier?: SubscriptionTier;
    completeness?: number;
  };
  productsCount: number;
  certificationsCount: number;
  hasInsightsAccess: boolean;
  insightsData?: {
    profileViews: number;
    contactClicks: number;
    rfqSent: number;
    productViews: number;
  };
}

export default function OEMDashboard() {
  return <DashboardContent />;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Reload data when refresh query param is present (e.g., after subscription)
  useEffect(() => {
    if (searchParams.get("refresh") === "true") {
      loadDashboardData();
      // Remove the query param from URL
      window.history.replaceState({}, "", "/dashboard/oem");
    }
  }, [searchParams]);

  async function loadDashboardData() {
    try {
      const supabase = createSupabaseBrowserClient();

      // Get profile with subscription and capabilities
      const profileRes = await fetch("/api/oem/profile");
      const profileData = await profileRes.json();

      // Get products count
      const productsRes = await fetch("/api/oem/products");
      const productsData = await productsRes.json();

      // Get certifications count
      const certsRes = await fetch("/api/oem/certifications");
      const certsData = await certsRes.json();

      // Get completeness
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        // Get Organization first
        const orgResult = await supabase
          .from("organizations")
          .select("id")
          .eq("owner_id", user.user.id)
          .eq("type", "oem")
          .single();

        const org = orgResult.data as { id?: string } | null;

        if (org && org.id) {
          const profileResult = await supabase
            .from("oem_profiles")
            .select("organization_id")
            .eq("organization_id", org.id)
            .single();

          const profile = profileResult.data as {
            organization_id?: string;
          } | null;

          if (profile && profile.organization_id) {
            const completenessResult = await (supabase as any).rpc(
              "calculate_oem_profile_completeness",
              { org_id: profile.organization_id } as any
            );
            const completeness = (completenessResult as any).data;

            const currentTier = profileData.profile?.currentTier || "FREE";

            // Get insights data if user has access
            let insightsData = undefined;
            if (
              currentTier === "INSIGHTS" ||
              currentTier === "VERIFIED_PARTNER"
            ) {
              try {
                const insightsRes = await fetch("/api/oem/insights?period=30");
                if (insightsRes.ok) {
                  const insightsResData = await insightsRes.json();
                  insightsData = {
                    profileViews: insightsResData.summary?.profileViews || 0,
                    contactClicks: insightsResData.summary?.contactClicks || 0,
                    rfqSent: insightsResData.summary?.rfqSent || 0,
                    productViews: insightsResData.summary?.productViews || 0,
                  };
                }
              } catch (error) {
                console.error("Failed to fetch insights:", error);
                // Set default empty insights data on error to prevent UI issues
                insightsData = {
                  profileViews: 0,
                  contactClicks: 0,
                  rfqSent: 0,
                  productViews: 0,
                };
              }
            }

            setData({
              profile: {
                ...profileData.profile,
                completeness: completeness ?? 0,
                currentTier,
              },
              productsCount: productsData.products?.length || 0,
              certificationsCount: certsData.certifications?.length || 0,
              hasInsightsAccess:
                currentTier === "INSIGHTS" ||
                currentTier === "VERIFIED_PARTNER",
              insightsData,
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  // Don't show loading spinner - let skeleton show via loading.tsx
  // Data will populate when ready

  // Only show 'Setup Required' if loading is done and we still have no data
  if (!loading && !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-2">Setup Required</h2>
          <p className="text-muted-foreground mb-4">
            Complete your OEM profile to access the dashboard
          </p>
          <Button asChild>
            <Link href="/onboarding/oem/setup/products">Start Setup</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const tier = (data?.profile as any)?.currentTier || "FREE";
  const completeness = data?.profile?.completeness || 0;

  return (
    <ProtectedClient>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="pt-24 pb-12">
          <div className="container mx-auto max-w-6xl">
            {/* Header */}
            <div className="flex justify-between items-start mb-8 animate-fade-in">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">OEM Dashboard</h1>
                  <TierBadge tier={tier as SubscriptionTier} />
                </div>
                <p className="text-muted-foreground">
                  {((data?.profile as any)?.company_name ??
                    (data?.profile as any)?.display_name ??
                    (data?.profile as any)?.company_name_th ??
                    "Your Company") +
                    " - Manage your profile and connect with buyers"}
                </p>
              </div>
              <Button size="lg" variant="outline" asChild>
                <Link href="/dashboard/oem/profile">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Package className="h-5 w-5 text-primary" />
                  <Badge variant="scale">{data?.productsCount ?? 0}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">Products</div>
                <Button
                  size="sm"
                  variant="link"
                  className="px-0 mt-1"
                  asChild
                >
                  <Link href="/onboarding/oem/setup/products">Manage</Link>
                </Button>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Award className="h-5 w-5 text-primary" />
                  <Badge variant="scale">{data?.certificationsCount ?? 0}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Certifications
                </div>
                <Button
                  size="sm"
                  variant="link"
                  className="px-0 mt-1"
                  asChild
                >
                  <Link href="/onboarding/oem/setup/certifications">
                    Manage
                  </Link>
                </Button>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Crown className="h-5 w-5 text-primary" />
                </div>
                <div className="text-sm text-muted-foreground mb-1">
                  Subscription
                </div>
                <div className="font-semibold">
                  {tier === "FREE"
                    ? "Free"
                    : tier === "INSIGHTS"
                      ? "Insights"
                      : "Verified Partner"}
                </div>
                <Button
                  size="sm"
                  variant="link"
                  className="px-0 mt-1"
                  asChild
                >
                  <Link href={ROUTES.pricing}>Upgrade</Link>
                </Button>
              </Card>

              {/* Insights Access Card */}
              {data?.hasInsightsAccess && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Analytics
                  </div>
                  <div className="font-semibold mb-2">Insights Dashboard</div>
                  <Button size="sm" className="w-full" asChild>
                    <Link href="/dashboard/oem/insights">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Insights
                    </Link>
                  </Button>
                </Card>
              )}

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted-foreground">
                    Profile Completeness
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CompletenessIndicator
                    percentage={completeness}
                    size="sm"
                  />
                  <div className="text-2xl font-bold">{completeness}%</div>
                </div>
              </Card>
            </div>

            {/* Profile Completion Alert */}
            {completeness < 100 && (
              <Card className="p-6 mb-8 border-primary/50 bg-primary/5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold mb-1">
                      Complete Your Profile
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Complete profiles get 3x more visibility and better
                      match scores
                    </p>
                  </div>
                  <Badge variant="scale">{completeness}%</Badge>
                </div>
                <div className="flex gap-2">
                  {data?.productsCount === 0 && (
                    <Button size="sm" asChild>
                      <Link href="/onboarding/oem/setup/products">
                        Add Products
                      </Link>
                    </Button>
                  )}
                  {data?.certificationsCount === 0 && (
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/onboarding/oem/setup/certifications">
                        Add Certifications
                      </Link>
                    </Button>
                  )}
                  {!(data?.profile as any)?.capabilities && (
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/onboarding/oem/setup/capabilities">
                        Add Capabilities
                      </Link>
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {/* Analytics Section - Insights Tier+ */}
            {data?.hasInsightsAccess && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-semibold">Analytics</h2>
                    <Badge variant="verified">Insights</Badge>
                  </div>
                  <Button asChild variant="outline">
                    <Link href="/dashboard/oem/insights">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Full Insights
                    </Link>
                  </Button>
                </div>
                {data?.insightsData ? (
                  <AnalyticsOverview
                    profileViews={data.insightsData.profileViews}
                    contactClicks={data.insightsData.contactClicks}
                    rfqSent={data.insightsData.rfqSent}
                    productViews={data.insightsData.productViews}
                    periodLabel="Last 30 days"
                  />
                ) : (
                  <Card className="p-12 text-center text-muted-foreground">
                    Loading analytics...
                  </Card>
                )}
              </div>
            )}

            {/* Financial Overview */}
            <OEMFinancialStats />

            {/* Upgrade Prompt - Free Tier Only */}
            {tier === "FREE" && (
              <Card className="p-8 bg-linear-to-br from-primary/5 to-primary/10 border-primary/20 mt-8">
                <div className="flex items-start gap-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">
                      Unlock Analytics & More Visibility
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Upgrade to Insights (฿2,999/mo) for analytics dashboard
                      or Verified Partner (฿9,999/mo) for featured placement,
                      media gallery, and priority support.
                    </p>
                    <div className="flex gap-3">
                      <Button asChild>
                        <Link href={ROUTES.pricing}>View Plans</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Insights Upgrade Prompt */}
            {tier === "INSIGHTS" && (
              <Card className="p-8 bg-linear-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20 mt-8">
                <div className="flex items-start gap-6">
                  <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                    <Crown className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">
                      Become a Verified Partner
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Get featured placement, video gallery for factory tours,
                      priority matching, and dedicated account manager for
                      ฿9,999/month.
                    </p>
                    <div className="flex gap-3">
                      <Button asChild>
                        <Link href={ROUTES.pricing}>Upgrade Now</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ProtectedClient>
  );
}
