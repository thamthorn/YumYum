"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import ProtectedClient from "@/components/ProtectedClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  // ...existing code...
  Eye,
  Mail,
  FileText,
  Package,
  Download,
  Crown,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { KeywordTable } from "@/components/AnalyticsOverview";
import dynamic from "next/dynamic";
import Link from "next/link";

const AnalyticsChart = dynamic(
  () => import("@/components/AnalyticsChart").then((mod) => mod.AnalyticsChart),
  {
    loading: () => (
      <div className="h-[300px] w-full animate-pulse bg-muted rounded-xl" />
    ),
    ssr: false,
  }
);
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface InsightsData {
  summary: {
    profileViews: number;
    contactClicks: number;
    rfqSent: number;
    productViews: number;
  };
  chartData: Array<{
    date: string;
    profile_views: number;
    contact_clicks: number;
    rfq_sent: number;
    product_views: number;
  }>;
  keywords: Array<{
    keyword: string;
    count: number;
    date: string;
  }>;
  period: number;
}

interface SubscriptionTier {
  tier: "FREE" | "INSIGHTS" | "VERIFIED_PARTNER";
}

export default function InsightsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState("30");
  const [tier, setTier] = useState<SubscriptionTier["tier"] | null>(null);
  const [loading, setLoading] = useState(true);

  // Check tier and access
  useEffect(() => {
    async function checkAccess() {
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        // Get organization
        const orgResult = await supabase
          .from("organizations")
          .select("id")
          .eq("owner_id", user.id)
          .eq("type", "oem")
          .single();

        const org = orgResult.data as { id?: string } | null;

        if (!org || !org.id) {
          router.push("/dashboard/oem");
          return;
        }

        const orgId = org.id;

        // Get subscription tier
        const subscriptionResult = await supabase
          .from("subscriptions")
          .select("tier")
          .eq("oem_org_id", orgId)
          .eq("status", "ACTIVE")
          .single();

        const subscription = subscriptionResult.data as {
          tier?: SubscriptionTier["tier"];
        } | null;

        const currentTier = subscription?.tier || "FREE";
        setTier(currentTier);

        if (currentTier === "FREE") {
          router.push("/dashboard/oem/subscription?locked=insights");
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error("Access check error:", error);
        router.push("/dashboard/oem");
      }
    }

    checkAccess();
  }, [router]);

  // Fetch insights data
  const { data: insightsData, isLoading } = useQuery<InsightsData>({
    queryKey: ["oem-insights", period],
    queryFn: async () => {
      const response = await fetch(`/api/oem/insights?period=${period}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch insights");
      }
      return response.json();
    },
    enabled: !loading && tier !== "FREE" && tier !== null,
  });

  // Export to CSV
  const handleExportCSV = () => {
    if (!insightsData) return;

    const csvRows = [
      ["Metric", "Value"],
      ["Profile Views", insightsData.summary.profileViews],
      ["Contact Clicks", insightsData.summary.contactClicks],
      ["RFQs Sent", insightsData.summary.rfqSent],
      ["Product Views", insightsData.summary.productViews],
      [],
      ["Date", "Profile Views", "Contact Clicks", "RFQs Sent", "Product Views"],
      ...insightsData.chartData.map((row) => [
        row.date,
        row.profile_views,
        row.contact_clicks,
        row.rfq_sent,
        row.product_views,
      ]),
    ];

    const csvContent = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `insights-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("CSV exported successfully");
  };

  // Export to PDF (Verified Partner only)
  const handleExportPDF = () => {
    if (tier !== "VERIFIED_PARTNER") return;
    toast.info("PDF export coming soon");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto max-w-7xl pt-24 pb-12 px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading insights...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tier === "FREE") {
    return null; // Will redirect
  }

  const isVerifiedPartner = tier === "VERIFIED_PARTNER";
  const topKeywords =
    insightsData?.keywords.slice(0, isVerifiedPartner ? 50 : 10) || [];
  // ...existing code...

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <ProtectedClient>
        <div className="container mx-auto max-w-7xl pt-24 pb-12 px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/oem">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-primary" />
                    Analytics & Insights
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Track your profile performance and engagement
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isVerifiedPartner && (
                  <Badge variant="verified" className="flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    Verified Partner
                  </Badge>
                )}
                {tier === "INSIGHTS" && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <BarChart3 className="h-3 w-3" />
                    Insights
                  </Badge>
                )}
              </div>
            </div>

            {/* Period Selector */}
            <div className="flex items-center gap-4">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  {isVerifiedPartner && (
                    <SelectItem value="365">Last year</SelectItem>
                  )}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                {isVerifiedPartner && (
                  <Button variant="outline" size="sm" onClick={handleExportPDF}>
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                )}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading analytics...</p>
              </div>
            </div>
          ) : insightsData && insightsData.summary.profileViews > 0 ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Profile Views
                      </p>
                      <p className="text-3xl font-bold">
                        {insightsData.summary.profileViews.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last {period} days
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Eye className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Contact Clicks
                      </p>
                      <p className="text-3xl font-bold">
                        {insightsData.summary.contactClicks.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {insightsData.summary.profileViews > 0
                          ? (
                              (insightsData.summary.contactClicks /
                                insightsData.summary.profileViews) *
                              100
                            ).toFixed(1)
                          : 0}
                        % of views
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        RFQs Received
                      </p>
                      <p className="text-3xl font-bold">
                        {insightsData.summary.rfqSent.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {insightsData.summary.profileViews > 0
                          ? (
                              (insightsData.summary.rfqSent /
                                insightsData.summary.profileViews) *
                              100
                            ).toFixed(1)
                          : 0}
                        % conversion
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Product Views
                      </p>
                      <p className="text-3xl font-bold">
                        {insightsData.summary.productViews.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last {period} days
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                      <Package className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Profile Views Over Time */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Profile Views Over Time
                  </h3>
                  {isVerifiedPartner ? (
                    <AnalyticsChart
                      data={{
                        labels: insightsData.chartData.map((d) =>
                          new Date(d.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        ),
                        datasets: [
                          {
                            label: "Profile Views",
                            data: insightsData.chartData.map(
                              (d) => d.profile_views
                            ),
                            borderColor: "rgb(59, 130, 246)",
                            backgroundColor: "rgba(59, 130, 246, 0.1)",
                          },
                        ],
                      }}
                      type="line"
                      height={300}
                    />
                  ) : (
                    <AnalyticsChart
                      data={{
                        labels: insightsData.chartData.map((d) =>
                          new Date(d.date).toLocaleDateString("en-US", {
                            month: "short",
                          })
                        ),
                        datasets: [
                          {
                            label: "Profile Views",
                            data: insightsData.chartData.map(
                              (d) => d.profile_views
                            ),
                            backgroundColor: "rgba(59, 130, 246, 0.5)",
                          },
                        ],
                      }}
                      type="bar"
                      height={300}
                    />
                  )}
                </Card>

                {/* Engagement Funnel (Verified Partner only) */}
                {isVerifiedPartner ? (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Engagement Funnel
                    </h3>
                    <AnalyticsChart
                      data={{
                        labels: ["Views", "Contacts", "RFQs"],
                        datasets: [
                          {
                            label: "Count",
                            data: [
                              insightsData.summary.profileViews,
                              insightsData.summary.contactClicks,
                              insightsData.summary.rfqSent,
                            ],
                            backgroundColor: [
                              "rgba(59, 130, 246, 0.5)",
                              "rgba(16, 185, 129, 0.5)",
                              "rgba(168, 85, 247, 0.5)",
                            ] as unknown as string,
                          },
                        ],
                      }}
                      type="bar"
                      height={300}
                    />
                  </Card>
                ) : (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Category Interest
                    </h3>
                    <div className="text-center py-12 text-muted-foreground">
                      Category breakdown coming soon
                    </div>
                  </Card>
                )}
              </div>

              {/* Keywords Section */}
              <Card className="p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    Top Search Keywords
                    {isVerifiedPartner ? " (Top 50)" : " (Top 10)"}
                  </h3>
                </div>
                <KeywordTable
                  keywords={topKeywords.map((k) => ({
                    keyword: k.keyword,
                    impressions: k.count,
                    clicks: 0, // TODO: Track clicks separately
                    ctr: 0,
                  }))}
                />
              </Card>

              {/* Competitor Section */}
              {isVerifiedPartner ? (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Competitor Leaderboard
                  </h3>
                  <div className="text-center py-12 text-muted-foreground">
                    Competitor analysis coming soon
                  </div>
                </Card>
              ) : (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Competitor Overview
                  </h3>
                  <div className="text-center py-12 text-muted-foreground">
                    Upgrade to Verified Partner for detailed competitor insights
                  </div>
                </Card>
              )}
            </>
          ) : (
            // Show Mock Data View if no real data exists
            <>
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-full shrink-0">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">
                    No data yet? Here&apos;s what it will look like.
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    This is a preview using example data. Once you get profile
                    views, your real analytics will appear here.
                  </p>
                </div>
              </div>

              {/* Mock Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  {
                    label: "Profile Views",
                    value: "1,245",
                    sub: "Last 30 days",
                    icon: Eye,
                    color: "text-blue-600",
                    bg: "bg-blue-100",
                  },
                  {
                    label: "Contact Clicks",
                    value: "86",
                    sub: "6.9% of views",
                    icon: Mail,
                    color: "text-green-600",
                    bg: "bg-green-100",
                  },
                  {
                    label: "RFQs Received",
                    value: "12",
                    sub: "1.0% conversion",
                    icon: FileText,
                    color: "text-purple-600",
                    bg: "bg-purple-100",
                  },
                  {
                    label: "Product Views",
                    value: "3,890",
                    sub: "Last 30 days",
                    icon: Package,
                    color: "text-orange-600",
                    bg: "bg-orange-100",
                  },
                ].map((card, i) => (
                  <Card key={i} className="p-6 relative overflow-hidden">
                    <Badge
                      variant="outline"
                      className="absolute top-2 right-2 text-[10px] px-1.5 py-0 h-5 bg-muted/50"
                    >
                      Example
                    </Badge>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {card.label}
                        </p>
                        <p className="text-3xl font-bold">{card.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {card.sub}
                        </p>
                      </div>
                      <div
                        className={`h-12 w-12 rounded-full ${card.bg} flex items-center justify-center`}
                      >
                        <card.icon className={`h-6 w-6 ${card.color}`} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Mock Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Profile Views Over Time */}
                <Card className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Profile Views Over Time
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      Example Data
                    </Badge>
                  </div>
                  <AnalyticsChart
                    data={{
                      labels: [
                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat",
                        "Sun",
                      ],
                      datasets: [
                        {
                          label: "Profile Views",
                          data: [45, 120, 85, 140, 90, 60, 110],
                          borderColor: "rgb(59, 130, 246)",
                          backgroundColor: "rgba(59, 130, 246, 0.1)",
                        },
                      ],
                    }}
                    type="line"
                    height={300}
                  />
                </Card>

                {/* Engagement Funnel */}
                <Card className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Engagement Funnel</h3>
                    <Badge variant="secondary" className="text-xs">
                      Example Data
                    </Badge>
                  </div>
                  <AnalyticsChart
                    data={{
                      labels: ["Views", "Contacts", "RFQs"],
                      datasets: [
                        {
                          label: "Count",
                          data: [1245, 86, 12],
                          backgroundColor: [
                            "rgba(59, 130, 246, 0.5)",
                            "rgba(16, 185, 129, 0.5)",
                            "rgba(168, 85, 247, 0.5)",
                          ] as unknown as string,
                        },
                      ],
                    }}
                    type="bar"
                    height={300}
                  />
                </Card>
              </div>

              {/* Mock Keywords Section */}
              <Card className="p-6 mb-8 relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    Top Search Keywords (Top 10)
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    Example Data
                  </Badge>
                </div>
                <KeywordTable
                  keywords={[
                    {
                      keyword: "organic snacks",
                      impressions: 450,
                      clicks: 32,
                      ctr: 7.1,
                    },
                    {
                      keyword: "private label coffee",
                      impressions: 320,
                      clicks: 28,
                      ctr: 8.7,
                    },
                    {
                      keyword: "vegan protein powder",
                      impressions: 210,
                      clicks: 15,
                      ctr: 7.1,
                    },
                    {
                      keyword: "gluten free pasta",
                      impressions: 180,
                      clicks: 12,
                      ctr: 6.6,
                    },
                    {
                      keyword: "custom packaging",
                      impressions: 150,
                      clicks: 8,
                      ctr: 5.3,
                    },
                  ]}
                />
              </Card>

              {/* Mock Competitor Section */}
              <Card className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {isVerifiedPartner
                      ? "Competitor Leaderboard"
                      : "Competitor Overview"}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    Example Data
                  </Badge>
                </div>
                {isVerifiedPartner ? (
                  <div className="space-y-4">
                    {[
                      { name: "Your Company", share: "15%", rank: 3 },
                      { name: "Competitor A", share: "28%", rank: 1 },
                      { name: "Competitor B", share: "22%", rank: 2 },
                      { name: "Competitor C", share: "12%", rank: 4 },
                      { name: "Competitor D", share: "8%", rank: 5 },
                    ]
                      .sort((a, b) => a.rank - b.rank)
                      .map((comp, i) => (
                        <div
                          key={i}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            comp.name === "Your Company"
                              ? "bg-primary/10 border border-primary/20"
                              : "bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                comp.rank <= 3
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {comp.rank}
                            </div>
                            <span
                              className={
                                comp.name === "Your Company"
                                  ? "font-semibold text-primary"
                                  : ""
                              }
                            >
                              {comp.name}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-muted-foreground">
                            {comp.share} Share
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Upgrade to Verified Partner for detailed competitor insights
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </ProtectedClient>
    </div>
  );
}
