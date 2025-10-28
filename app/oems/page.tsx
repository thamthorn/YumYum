"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/lib/supabase/session-context";
import {
  Factory,
  Home,
  MapPin,
  CheckCircle2,
  Package,
  Globe,
  Shirt,
  Coffee,
  Sparkles,
  Stethoscope,
  GraduationCap,
  MoreHorizontal,
  LucideIcon,
} from "lucide-react";
import { Industry, ROUTES, COPY, getScaleBadgeVariant, getVerifiedBadgeVariant } from "@/data/MockData";
import type {
  Database,
  VerificationTier,
  ScaleType,
} from "@/types/database";

type OemRow =
  Database["public"]["Tables"]["oem_profiles"]["Row"] & {
    organizations: {
      id: string;
      display_name: string;
      industry: string | null;
      location: string | null;
      description: string | null;
      website: string | null;
      slug: string | null;
    } | null;
    oem_services: Array<{
      services: {
        name: string | null;
      } | null;
    }> | null;
    oem_certifications: Array<{
      verified: boolean | null;
      verification_tier: VerificationTier | null;
      certifications: {
        name: string | null;
      } | null;
    }> | null;
  };

type OemCard = {
  id: string;
  slug: string | null;
  name: string;
  industry: string | null;
  scale: "Small" | "Medium" | "Large";
  moqMin: number;
  moqMax: number | null;
  services: string[];
  location: string | null;
  crossBorder: boolean;
  verification: "None" | "Verified" | "Certified" | "Trusted Partner";
  rating: number | null;
  totalReviews: number | null;
};

const industries: { value: Industry; label: string; icon: LucideIcon }[] = [
  { value: "Fashion", label: "Fashion", icon: Shirt },
  { value: "F&B", label: "Food & Beverage", icon: Coffee },
  { value: "Cosmetics", label: "Cosmetics", icon: Sparkles },
  { value: "Dental/Medical", label: "Dental/Medical", icon: Stethoscope },
  { value: "Education", label: "Education", icon: GraduationCap },
  { value: "Other", label: "Other", icon: MoreHorizontal },
];

export default function OEMList() {
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(
    null
  );
  const router = useRouter();
  const { toast } = useToast();
  const { session, supabase } = useSupabase();

  const {
    data: oemRows = [],
    isLoading: isFetchingOEMs,
    error: oemError,
  } = useQuery<OemRow[]>({
    queryKey: ["oems"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oem_profiles")
        .select(
          `
            organization_id,
            scale,
            moq_min,
            moq_max,
            lead_time_days,
            prototype_support,
            cross_border,
            rating,
            total_reviews,
            organizations:organizations!inner(
              id,
              display_name,
              industry,
              location,
              slug
            ),
            oem_services (
              services (
                name
              )
            ),
            oem_certifications (
              verification_tier,
              certifications (
                name
              )
            )
          `
        );

      if (error) {
        throw error;
      }

      return (data as OemRow[]) ?? [];
    },
  });

  const oems: OemCard[] = useMemo(() => {
    if (!selectedIndustry) return [];
    const tierOrder: VerificationTier[] = [
      "trusted_partner",
      "certified",
      "verified",
      "none",
    ];

    const tierLabel: Record<VerificationTier, OemCard["verification"]> = {
      trusted_partner: "Trusted Partner",
      certified: "Certified",
      verified: "Verified",
      none: "None",
    };

    const resolveVerification = (
      certs: OemRow["oem_certifications"]
    ): OemCard["verification"] => {
      if (!certs || certs.length === 0) return "None";
      const sorted = [...certs].sort((a, b) => {
        const idxA = tierOrder.indexOf(a.verification_tier ?? "none");
        const idxB = tierOrder.indexOf(b.verification_tier ?? "none");
        return idxA - idxB;
      });
      const top = sorted[0];
      return tierLabel[top.verification_tier ?? "none"];
    };

    const scaleMap: Record<ScaleType, OemCard["scale"]> = {
      small: "Small",
      medium: "Medium",
      large: "Large",
    };

    const filteredRows = selectedIndustry
      ? oemRows.filter((row) => row.organizations?.industry === selectedIndustry)
      : oemRows;

    return filteredRows
      .map((row) => {
        const services =
          row.oem_services
            ?.map((entry) => entry.services?.name ?? "")
            .filter((name): name is string => Boolean(name)) ?? [];

      return {
        id: row.organizations?.id ?? row.organization_id,
        slug: row.organizations?.slug ?? null,
        name: row.organizations?.display_name ?? "Unnamed OEM",
        industry: row.organizations?.industry ?? null,
        scale: row.scale ? scaleMap[row.scale] : "Medium",
        moqMin: row.moq_min ?? 0,
        moqMax: row.moq_max ?? null,
        services,
        location: row.organizations?.location ?? null,
        crossBorder: Boolean(row.cross_border),
        verification: resolveVerification(row.oem_certifications),
        rating: row.rating,
        totalReviews: row.total_reviews,
      };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [oemRows, selectedIndustry]);

  const handleViewProfile = (oem: OemCard) => {
    if (!session) {
      toast({
        description: COPY.toasts.needLoginProfile,
      });
      const target = oem.slug ?? oem.id;
      router.push(`${ROUTES.login}?next=${encodeURIComponent(ROUTES.oemProfile(target))}`);
      return;
    }

    const target = oem.slug ?? oem.id;
    router.push(ROUTES.oemProfile(target));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-32 pb-20">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">
              {COPY.pages.oemList.title}{" "}
              <span className="text-primary">
                {COPY.pages.oemList.titleHighlight}
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {COPY.pages.oemList.subtitle}
            </p>
          </div>

          {/* Industry Selector */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              {COPY.pages.oemList.selectIndustry}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {industries.map((industry) => {
                const Icon = industry.icon;
                return (
                  <button
                    key={industry.value}
                    onClick={() => setSelectedIndustry(industry.value)}
                    className={`p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
                      selectedIndustry === industry.value
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          selectedIndustry === industry.value
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <span
                        className={`font-medium text-sm ${
                          selectedIndustry === industry.value
                            ? "text-primary"
                            : "text-foreground"
                        }`}
                      >
                        {industry.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* OEM List */}
          {selectedIndustry && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">
                  {industries.find((i) => i.value === selectedIndustry)?.label}{" "}
                  OEMs
                  <span className="text-muted-foreground ml-2">
                    ({oems.length})
                  </span>
                </h2>
              </div>

              {oemError ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">
                    Unable to load OEMs right now. Please try again later.
                  </p>
                </Card>
              ) : isFetchingOEMs ? (
                <Card className="p-12 text-center">
                  <Factory className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                  <p className="text-muted-foreground">
                    Loading manufacturers...
                  </p>
                </Card>
              ) : oems.length === 0 ? (
                <Card className="p-12 text-center">
                  <Factory className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {COPY.pages.oemList.noOEMs}
                  </p>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {oems.map((oem) => (
                    <Card
                      key={oem.id}
                      className="p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="space-y-4">
                        {/* Header */}
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg">
                              {oem.name}
                            </h3>
                            {oem.scale === "Large" ? (
                              <Factory className="h-5 w-5 text-primary" />
                            ) : (
                              <Home className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant={getScaleBadgeVariant(oem.scale)}>
                              {oem.scale}
                            </Badge>
                            <Badge
                              variant={getVerifiedBadgeVariant(
                                oem.verification
                              )}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {oem.verification}
                            </Badge>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {oem.location}
                          {oem.crossBorder && (
                            <Badge variant="outline" className="ml-2">
                              <Globe className="h-3 w-3 mr-1" />
                              Cross-border
                            </Badge>
                          )}
                        </div>

                        {/* MOQ */}
                        <div className="flex items-center gap-2 text-sm">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">MOQ:</span>
                          <span className="font-medium">
                            {oem.moqMin.toLocaleString()}
                            {oem.moqMax
                              ? ` - ${oem.moqMax.toLocaleString()}`
                              : "+"}
                          </span>
                        </div>

                        {/* Services */}
                        <div>
                          <p className="text-sm font-medium mb-2">
                            Key Services:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {oem.services.slice(0, 3).map((service, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs"
                              >
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* CTA */}
                        <Button onClick={() => handleViewProfile(oem)} className="w-full">
                          {COPY.ctas.viewProfile}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!selectedIndustry && (
            <Card className="p-12 text-center">
              <Factory className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {COPY.pages.oemList.emptyStateTitle}
              </h3>
              <p className="text-muted-foreground">
                {COPY.pages.oemList.emptyStateSubtitle}
              </p>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
