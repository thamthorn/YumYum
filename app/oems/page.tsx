"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { OEMFilters, type OEMFilterState } from "@/components/OEMFilters";
import { OEMCardList } from "@/components/OEMCard";
import { useToast } from "@/hooks/use-toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Factory, Sparkles } from "lucide-react";
import { ROUTES } from "@/data/MockData";
import type { SubscriptionTier } from "@/types/platform";
import { MATCHING_WEIGHTS } from "@/types/platform";

interface OEMData {
  id: string;
  slug: string;
  companyName: string;
  logo: string | null;
  location: string;
  description: string;
  tier: SubscriptionTier;
  categories: string[];
  moq: number;
  profileMoq: number | null;
  leadTime: number;
  products: Array<{
    category: string;
    moq: number;
    leadTimeDays: number;
    priceRangeMin: number | null;
    images: string[];
  }>;
  productCount: number;
  certifications: string[];
  capabilities: {
    hasRdSupport: boolean;
    hasPackagingDesign: boolean;
    hasFormulaLibrary: boolean;
    hasWhiteLabel: boolean;
    hasExportSupport: boolean;
  };
  media: Array<{
    mediaUrl: string;
    thumbnailUrl: string | null;
  }>;
  rating: number;
  reviewCount: number;
}

interface OEMWithScore extends OEMData {
  matchScore: number;
  matchReasons: string[];
}

function OEMListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [oems, setOems] = useState<OEMData[]>([]);
  const [filteredOEMs, setFilteredOEMs] = useState<OEMWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedOEMs, setBookmarkedOEMs] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<OEMFilterState>({
    search: "",
    tiers: [],
    categories: [],
    certifications: [],
    moqRange: [0, 10000000],
    leadTimeRange: [0, 180],
    location: [],
    services: [],
    hasRnD: false,
    hasPackaging: false,
    hasFormulaLibrary: false,
    hasWhiteLabel: false,
    canExport: false,
  });

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      const categoryMap: Record<string, string> = {
        condiments: "Condiments",
        skincare: "Skincare",
        "shipping-packaging": "Shipping Packaging",
        accessories: "Accessories",
        beverages: "Beverages",
        snacks: "Snacks",
        "food-packaging": "Food Packaging",
        apparel: "Apparel",
        "home-decor": "Home Decor",
        "gift-packaging": "Gift Packaging",
        beverage: "Beverages",
        packaging: "Shipping Packaging",
        clothing: "Apparel",
      };

      const categoryName = categoryMap[categoryParam.toLowerCase()] || categoryParam;

      setFilters((prev) => ({
        ...prev,
        categories: [categoryName],
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    loadOEMs();
    fetchBookmarks();
  }, []);

  useEffect(() => {
    applyFiltersAndCalculateScores();
  }, [oems, filters]);

  async function handleOEMClick(oemId: string) {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: user } = await supabase.auth.getUser();
      if (user?.user) {
        await (supabase as any).rpc("log_analytics_event", {
          p_oem_profile_id: oemId,
          p_event_type: "profile_view",
          p_metadata: { source: "search_results" },
        });
      }
    } catch (err) {
      console.error("Analytics logging failed", err);
    }
  }

  async function loadOEMs() {
    try {
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase
        .from("oem_profiles")
        .select(
          `
          *,
          organizations (
            display_name,
            location,
            slug,
            logo_url
          )
        `
        )
        .in("profile_status", [
          "ACTIVE",
          "REGISTERED",
          "VERIFIED",
          "VERIFIED_PENDING",
        ]);

      if (error) throw error;

      if (!data || data.length === 0) {
        setOems([]);
        setLoading(false);
        return;
      }

      const oemsWithData = await Promise.all(
        data.map(async (profile: any) => {
          const { data: capabilities } = await supabase
            .from("oem_capabilities")
            .select("*")
            .eq("oem_org_id", profile.organization_id)
            .maybeSingle();

          const { data: products } = await supabase
            .from("products")
            .select(
              `
              category,
              moq,
              lead_time_days,
              price_min,
              price_max,
              product_images(image_url)
            `
            )
            .eq("oem_org_id", profile.organization_id);

          const { data: certifications } = await supabase
            .from("oem_certifications")
            .select("certification_type")
            .eq("oem_org_id", profile.organization_id);

          const { data: media } = await supabase
            .from("oem_media")
            .select("video_url, thumbnail_url")
            .eq("oem_org_id", profile.organization_id);

          const { data: tier } = await (supabase as any).rpc("get_oem_tier", {
            org_id: profile.organization_id,
          });

          return {
            profile,
            capabilities,
            products: products || [],
            certifications: certifications || [],
            media: media || [],
            tier: tier || "FREE",
          };
        })
      );

      const transformed: OEMData[] = oemsWithData.map((item: any) => {
        const products = item.products.map((p: any) => ({
          category: p.category,
          moq: p.moq,
          leadTimeDays: p.lead_time_days,
          priceRangeMin: p.price_min,
          images: (p.product_images || []).map((img: any) => img.image_url),
        }));

        const categories = Array.from(
          new Set(products.map((p: any) => p.category).filter(Boolean))
        ) as string[];

        const productMoq =
          products.length > 0
            ? Math.min(...products.map((p: any) => p.moq || 0))
            : 0;

        const profileMoq = item.profile.moq_min;
        
        // Prefer profile MOQ, fallback to product MOQ
        const displayMoq = profileMoq ?? productMoq;

        const leadTime =
          products.length > 0
            ? Math.max(...products.map((p: any) => p.leadTimeDays || 0))
            : 0;

        return {
          id: item.profile.organization_id,
          slug: item.profile.organizations?.slug || item.profile.organization_id,
          companyName: item.profile.organizations?.display_name || "Unnamed Factory",
          logo: item.profile.organizations?.logo_url || null,
          location: item.profile.organizations?.location || "Thailand",
          description: item.profile.description,
          tier: item.tier,
          categories,
          moq: displayMoq,
          profileMoq: profileMoq,
          leadTime,
          products,
          productCount: products.length,
          certifications: Array.from(
            new Set(
              item.certifications
                .map((c: any) => c.certification_type)
                .filter(Boolean)
            )
          ),
          capabilities: {
            hasRdSupport: item.capabilities?.has_rd || false,
            hasPackagingDesign: item.capabilities?.has_packaging || false,
            hasFormulaLibrary: item.capabilities?.has_formula_library || false,
            hasWhiteLabel: item.capabilities?.has_white_label || false,
            hasExportSupport: item.capabilities?.has_export_experience || false,
          },
          media: (item.media || []).map((m: any) => ({
            mediaUrl: m.video_url,
            thumbnailUrl: m.thumbnail_url,
          })),
          rating: item.profile.rating || 0,
          reviewCount: item.profile.review_count || 0,
        };
      });

      setOems(transformed);
    } catch (error) {
      console.error("Failed to load OEMs:", error);
      toast({
        title: "Error",
        description: "Failed to load manufacturers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchBookmarks() {
    try {
      const response = await fetch("/api/saved-oems");
      if (response.ok) {
        const data = await response.json();
        if (data.savedOems) {
          setBookmarkedOEMs(data.savedOems.map((item: any) => item.oem_org_id));
        }
      }
    } catch (error) {
      console.error("Failed to fetch bookmarks:", error);
    }
  }

  function calculateMatchScore(oem: OEMData): {
    score: number;
    reasons: string[];
  } {
    let score = 0;
    const reasons: string[] = [];

    const categoryMatch = oem.products.some((p) =>
      filters.categories.length === 0
        ? true
        : filters.categories.includes(p.category)
    );
    if (categoryMatch) {
      score += MATCHING_WEIGHTS.category;
      reasons.push("Category match");
    }

    const moqMatch = oem.products.some(
      (p) => p.moq >= filters.moqRange[0] && p.moq <= filters.moqRange[1]
    );
    if (moqMatch) {
      score += MATCHING_WEIGHTS.moq;
      reasons.push("MOQ within range");
    }

    const leadTimeMatch = oem.products.some(
      (p) =>
        p.leadTimeDays >= filters.leadTimeRange[0] &&
        p.leadTimeDays <= filters.leadTimeRange[1]
    );
    if (leadTimeMatch) {
      score += MATCHING_WEIGHTS.leadTime;
      reasons.push("Lead time suitable");
    }

    const certMatch =
      filters.certifications.length === 0 ||
      filters.certifications.some((c) => oem.certifications.includes(c));
    if (certMatch && filters.certifications.length > 0) {
      score += MATCHING_WEIGHTS.certifications;
      reasons.push("Has required certifications");
    }

    const tierBonus: Record<SubscriptionTier, number> = {
      VERIFIED_PARTNER: 5,
      INSIGHTS: 3,
      FREE: 0,
    };
    score += tierBonus[oem.tier];
    if (oem.tier !== "FREE") {
      reasons.push(
        `${oem.tier === "VERIFIED_PARTNER" ? "Verified Partner" : "Insights"} tier`
      );
    }

    if (filters.hasRnD && oem.capabilities.hasRdSupport) {
      score += 2;
      reasons.push("R&D Support");
    }
    if (filters.hasPackaging && oem.capabilities.hasPackagingDesign) {
      score += 2;
      reasons.push("Packaging Design");
    }
    if (filters.hasFormulaLibrary && oem.capabilities.hasFormulaLibrary) {
      score += 2;
      reasons.push("Formula Library");
    }
    if (filters.hasWhiteLabel && oem.capabilities.hasWhiteLabel) {
      score += 2;
      reasons.push("White Label");
    }
    if (filters.canExport && oem.capabilities.hasExportSupport) {
      score += 2;
      reasons.push("Export Support");
    }

    return { score: Math.min(score, 100), reasons };
  }

  function applyFiltersAndCalculateScores() {
    let filtered = [...oems];

    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(
        (oem) =>
          oem.companyName.toLowerCase().includes(query) ||
          oem.description?.toLowerCase().includes(query) ||
          oem.products.some((p) => p.category.toLowerCase().includes(query))
      );
    }

    if (filters.tiers.length > 0) {
      filtered = filtered.filter((oem) => filters.tiers.includes(oem.tier));
    }

    if (filters.categories.length > 0) {
      const normalizedFilterCategories = filters.categories.map((c) =>
        c.toLowerCase()
      );
      filtered = filtered.filter((oem) =>
        oem.products.some((p) =>
          normalizedFilterCategories.includes(p.category?.toLowerCase() || "")
        )
      );
    }

    if (filters.certifications.length > 0) {
      filtered = filtered.filter((oem) =>
        filters.certifications.some((c) => oem.certifications.includes(c))
      );
    }

    // MOQ filter: Check BOTH profile MOQ and product MOQ (OR logic)
    filtered = filtered.filter((oem) => {
      // If no products and no profile MOQ, keep the OEM
      if (oem.products.length === 0 && !oem.profileMoq) return true;
      
      // Check if profile MOQ is within range
      const profileMoqMatch = oem.profileMoq !== null && 
        oem.profileMoq >= filters.moqRange[0] && 
        oem.profileMoq <= filters.moqRange[1];
      
      // Check if any product MOQ is within range
      const productMoqMatch = oem.products.some(
        (p) => p.moq >= filters.moqRange[0] && p.moq <= filters.moqRange[1]
      );
      
      // Keep if EITHER profile MOQ OR product MOQ matches (OR logic)
      return profileMoqMatch || productMoqMatch;
    });

    filtered = filtered.filter((oem) =>
      oem.products.length === 0 ||
      oem.products.some(
        (p) =>
          p.leadTimeDays >= filters.leadTimeRange[0] &&
          p.leadTimeDays <= filters.leadTimeRange[1]
      )
    );

    if (filters.location.length > 0) {
      filtered = filtered.filter((oem) =>
        filters.location.some((loc) =>
          oem.location.toLowerCase().includes(loc.toLowerCase())
        )
      );
    }

    if (filters.hasRnD) filtered = filtered.filter((oem) => oem.capabilities.hasRdSupport);
    if (filters.hasPackaging) filtered = filtered.filter((oem) => oem.capabilities.hasPackagingDesign);
    if (filters.hasFormulaLibrary) filtered = filtered.filter((oem) => oem.capabilities.hasFormulaLibrary);
    if (filters.hasWhiteLabel) filtered = filtered.filter((oem) => oem.capabilities.hasWhiteLabel);
    if (filters.canExport) filtered = filtered.filter((oem) => oem.capabilities.hasExportSupport);

    const withScores: OEMWithScore[] = filtered.map((oem) => {
      const { score, reasons } = calculateMatchScore(oem);
      return {
        ...oem,
        matchScore: score,
        matchReasons: reasons,
      };
    });

    const tierOrder: Record<SubscriptionTier, number> = {
      VERIFIED_PARTNER: 3,
      INSIGHTS: 2,
      FREE: 1,
    };

    withScores.sort((a, b) => {
      if (a.matchScore !== b.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return tierOrder[b.tier] - tierOrder[a.tier];
    });

    setFilteredOEMs(withScores);
  }

  async function handleBookmark(oemId: string) {
    const supabase = createSupabaseBrowserClient();

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Login Required",
          description: "Please login to bookmark manufacturers",
        });
        router.push(`${ROUTES.login}?next=${encodeURIComponent("/oems")}`);
        return;
      }

      const isBookmarked = bookmarkedOEMs.includes(oemId);

      if (isBookmarked) {
        const response = await fetch(`/api/saved-oems?oemOrgId=${oemId}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to remove bookmark");

        setBookmarkedOEMs((prev) => prev.filter((id) => id !== oemId));
        toast({
          title: "Removed",
          description: "Manufacturer removed from your list",
        });
      } else {
        const response = await fetch("/api/saved-oems", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ oemOrgId: oemId }),
        });

        if (!response.ok) {
          const data = await response.json();
          if (response.status === 409) {
            setBookmarkedOEMs((prev) => [...prev, oemId]);
            return;
          }
          throw new Error(data.error || "Failed to bookmark");
        }

        setBookmarkedOEMs((prev) => [...prev, oemId]);
        toast({
          title: "Bookmarked",
          description: "Manufacturer saved to your list",
        });
      }
    } catch (error) {
      console.error("Failed to update bookmark:", error);
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
    }
  }

  // Show UI immediately, data will populate when ready
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-32 pb-20">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <h1 className="text-5xl font-bold">
                Find Your Perfect{" "}
                <span className="text-primary">Manufacturing Partner</span>
              </h1>
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse verified food & beverage OEM manufacturers with AI-powered
              matching
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <OEMFilters
              filters={filters}
              onChange={setFilters}
              onReset={() =>
                setFilters({
                  search: "",
                  tiers: [],
                  categories: [],
                  certifications: [],
                  moqRange: [0, 10000000],
                  leadTimeRange: [0, 180],
                  location: [],
                  services: [],
                  hasRnD: false,
                  hasPackaging: false,
                  hasFormulaLibrary: false,
                  hasWhiteLabel: false,
                  canExport: false,
                })
              }
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-md px-3 py-1 text-sm ${
                  viewMode === "grid" ? "bg-primary text-white" : "bg-muted"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-md px-3 py-1 text-sm ${
                  viewMode === "list" ? "bg-primary text-white" : "bg-muted"
                }`}
              >
                List
              </button>
            </div>
          </div>

          {/* Results */}
          {!loading && filteredOEMs.length === 0 ? (
            <Card className="p-12 text-center">
              <Factory className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No matches found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters to see more results
              </p>
              <Button
                onClick={() =>
                  setFilters({
                    search: "",
                    tiers: [],
                    categories: [],
                    certifications: [],
                    moqRange: [0, 10000000],
                    leadTimeRange: [0, 180],
                    location: [],
                    services: [],
                    hasRnD: false,
                    hasPackaging: false,
                    hasFormulaLibrary: false,
                    hasWhiteLabel: false,
                    canExport: false,
                  })
                }
              >
                Reset Filters
              </Button>
            </Card>
          ) : (
            <OEMCardList
              oems={filteredOEMs}
              variant={viewMode}
              onBookmark={handleBookmark}
              bookmarkedOEMs={bookmarkedOEMs}
              onOEMClick={handleOEMClick}
            />
          )}
        </div>
      </section>
    </div>
  );
}

export default function OEMPage() {
  return <OEMListContent />;
}