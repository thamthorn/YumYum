"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Navigation from "@/components/Navigation";
import { ROUTES, COPY, getVerifiedBadgeVariant } from "@/data/MockData";
import {
  Factory,
  Home,
  MapPin,
  Star,
  Filter,
  ArrowUpDown,
  Globe,
  Rocket,
  CheckCircle2,
  Package,
  Wand2,
  Sparkles,
} from "lucide-react";
import { useSupabase } from "@/lib/supabase/session-context";
import { toast } from "sonner";

type OEMResponse = {
  organizationId: string;
  name: string;
  slug: string | null;
  industry: string | null;
  location: string | null;
  scale: "small" | "medium" | "large" | null;
  moqMin: number | null;
  moqMax: number | null;
  crossBorder: boolean | null;
  prototypeSupport: boolean | null;
  rating: number | null;
  totalReviews: number | null;
  leadTimeDays: number | null;
  certifications: Array<{ name: string; issuedBy: string }>;
  services?: Array<{ name: string }>;
};

type OEMCard = {
  oemOrgId: string;
  name: string;
  slug: string | null;
  industry: string | null;
  location: string | null;
  scale: "Small" | "Medium" | "Large";
  moqMin: number | null;
  moqMax: number | null;
  crossBorder: boolean;
  rating: number | null;
  totalReviews: number | null;
  leadTimeDays: number | null;
  certifications: string[];
  services?: string[];
  tags?: string[];
  aiRank?: number;
  aiScore?: number;
  matchScore?: number;
  matchReasons?: string[];
};

type AiResult = {
  organizationId: string;
  name: string;
  slug?: string | null;
  industry?: string | null;
  location?: string | null;
  scale?: "small" | "medium" | "large";
  moqMin?: number | null;
  moqMax?: number | null;
  crossBorder?: boolean;
  rating?: number | null;
  totalReviews?: number | null;
  certifications?: Array<{ name: string }>;
  aiRank?: number;
  aiScore?: number;
  matchReasons?: string[];
};

export default function Results() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("best-match");
  const [moqRange, setMoqRange] = useState<[number, number]>([1, 10000]);
  const [selectedScale, setSelectedScale] = useState<string[]>([]);
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("any");
  const [leadTimeRange, setLeadTimeRange] = useState<[number, number]>([1, 90]);
  const [aiResults, setAiResults] = useState<AiResult[]>([]);
  const [searchMode, setSearchMode] = useState<string>("");
  const [userPreferences, setUserPreferences] = useState<{
    productType?: string;
    timeline?: string;
    quickMatch?: boolean;
    minPrice?: number;
    maxPrice?: number;
  } | null>(null);
  const { session, supabase } = useSupabase();

  // Fetch available service tags from database
  useEffect(() => {
    const fetchServices = async () => {
      if (!supabase) return;

      try {
        const { data, error } = await supabase
          .from("services")
          .select("name")
          .order("name");

        if (error) throw error;

        if (data) {
          const uniqueTags = Array.from(
            new Set(data.map((s: { name: string }) => s.name))
          );
          setAvailableTags(uniqueTags);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        // Fallback to default tags if database fetch fails
        setAvailableTags([
          "Low MOQ Friendly",
          "Eco Packaging",
          "Fast Turnaround",
          "Prototype Support",
          "International Shipping",
          "Custom Design",
          "Bulk Discount",
          "Quality Certified",
        ]);
      }
    };

    fetchServices();
  }, [supabase]);

  // Check for AI search results from sessionStorage
  useEffect(() => {
    const mode = sessionStorage.getItem("searchMode");
    setSearchMode(mode || "");

    if (mode === "ai") {
      const results = sessionStorage.getItem("aiSearchResults");
      if (results) {
        try {
          const parsed = JSON.parse(results);
          setAiResults(parsed);
          setSortBy("ai-rank"); // Set sort to AI ranking
          // Clear from storage after loading
          sessionStorage.removeItem("aiSearchResults");
          sessionStorage.removeItem("searchMode");
        } catch (e) {
          console.error("Failed to parse AI results:", e);
        }
      }
    }

    // Load user preferences from onboarding
    const preferences = sessionStorage.getItem("userPreferences");
    if (preferences) {
      try {
        const parsed = JSON.parse(preferences);
        if (parsed.moqRange) setMoqRange(parsed.moqRange as [number, number]);

        // Set lead time range based on timeline preference
        if (parsed.timeline) {
          let maxDays = 90; // default flexible
          if (parsed.timeline === "urgent") maxDays = 14;
          else if (parsed.timeline === "standard") maxDays = 60;
          setLeadTimeRange([1, maxDays]);
        }

        // Store for API query
        setUserPreferences({
          productType: parsed.productType,
          timeline: parsed.timeline,
          quickMatch: parsed.quickMatch,
          minPrice: parsed.priceRange?.[0],
          maxPrice: parsed.priceRange?.[1],
        });
        // Don't clear preferences so user can go back and see them
      } catch (e) {
        console.error("Failed to parse user preferences:", e);
      }
    }
  }, []);

  // Fetch buyer's organization ID and industry preference
  const { data: buyerData } = useQuery<{
    orgId: string;
    industry: string | null;
  } | null>({
    queryKey: ["buyer-data", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      // Get the buyer's organization ID and industry from organization_members + organizations
      const { data: membership, error: membershipError } = await supabase
        .from("organization_members")
        .select("organization_id, organizations(industry)")
        .eq("profile_id", session.user.id)
        .single();

      if (membershipError) {
        console.error("Failed to fetch buyer organization:", membershipError);
        return null;
      }

      // @ts-expect-error - Supabase types are too strict here
      const orgId = membership?.organization_id;
      // @ts-expect-error - Supabase types are too strict here
      const industry = membership?.organizations?.industry ?? null;

      if (!orgId) return null;

      return {
        orgId,
        industry,
      };
    },
    enabled: Boolean(session?.user?.id),
  });

  const {
    data: oems = [],
    isLoading,
    error,
  } = useQuery<OEMResponse[]>({
    queryKey: [
      "oems-browse",
      buyerData?.industry,
      buyerData?.industry,
      userPreferences?.productType,
      userPreferences?.timeline,
      userPreferences?.minPrice,
      userPreferences?.maxPrice,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "100" });
      const industry = buyerData?.industry;
      if (industry) {
        params.set("industry", industry);
      }

      // Add timeline filter
      if (userPreferences?.timeline) {
        params.set("timeline", userPreferences.timeline);
      }

      // Add product type filter if available
      if (userPreferences?.productType) {
        params.set("productType", userPreferences.productType);
      }

      // Add price range filter if available
      if (userPreferences?.minPrice !== undefined) {
        params.set("minPrice", userPreferences.minPrice.toString());
      }
      if (userPreferences?.maxPrice !== undefined) {
        params.set("maxPrice", userPreferences.maxPrice.toString());
      }

      const url = `/api/oems?${params}`;
      const response = await fetch(url);
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Unable to load OEMs");
      }
      const body = (await response.json()) as { data: OEMResponse[] };
      return body.data ?? [];
    },
    enabled: Boolean(session),
  });

  const cards: OEMCard[] = useMemo(() => {
    // If we have AI results, use those instead
    if (aiResults.length > 0) {
      return aiResults.map((result) => {
        const scale: "Small" | "Medium" | "Large" =
          result.scale === "large"
            ? "Large"
            : result.scale === "small"
              ? "Small"
              : "Medium";
        return {
          oemOrgId: result.organizationId,
          name: result.name,
          slug: result.slug ?? null,
          industry: result.industry ?? null,
          location: result.location ?? null,
          scale,
          moqMin: result.moqMin ?? null,
          moqMax: result.moqMax ?? null,
          crossBorder: result.crossBorder ?? false,
          rating: result.rating ?? null,
          totalReviews: result.totalReviews ?? null,
          leadTimeDays: null, // AI results don't have lead time yet
          certifications: result.certifications?.map((c) => c.name) || [],
          aiRank: result.aiRank,
          aiScore: result.aiScore,
          matchReasons: result.matchReasons,
        };
      });
    }

    // Otherwise use regular OEM data
    return oems.map((oem) => {
      const scale: "Small" | "Medium" | "Large" =
        oem.scale === "large"
          ? "Large"
          : oem.scale === "small"
            ? "Small"
            : "Medium";
      return {
        oemOrgId: oem.organizationId,
        name: oem.name,
        slug: oem.slug,
        industry: oem.industry,
        location: oem.location,
        scale,
        moqMin: oem.moqMin,
        moqMax: oem.moqMax,
        crossBorder: Boolean(oem.crossBorder),
        rating: oem.rating,
        totalReviews: oem.totalReviews,
        leadTimeDays: oem.leadTimeDays,
        certifications: oem.certifications.map((c) => c.name),
        services: oem.services?.map((s) => s.name) || [],
      };
    });
  }, [oems, aiResults]);

  const allCerts = useMemo(() => {
    const set = new Set<string>();
    cards.forEach((card) =>
      card.certifications.forEach((cert) => set.add(cert))
    );
    return Array.from(set);
  }, [cards]);

  // Calculate matching score for each OEM based on user preferences
  const calculateMatchingScore = (oem: OEMCard): number => {
    if (oem.aiScore) return oem.aiScore; // Use AI score if available

    let score = 0;
    let totalCriteria = 0;

    // MOQ Match (40% weight)
    totalCriteria += 40;
    if (oem.moqMin !== null && oem.moqMax !== null) {
      const userMoqMin = moqRange[0];
      const userMoqMax = moqRange[1];

      // Perfect match if ranges overlap
      if (oem.moqMin <= userMoqMax && oem.moqMax >= userMoqMin) {
        score += 40;
      } else if (oem.moqMin <= userMoqMax * 1.5) {
        // Partial match if close
        score += 20;
      }
    }

    // Lead Time Match (40% weight)
    totalCriteria += 40;
    if (oem.leadTimeDays !== null && leadTimeRange[1] > 0) {
      if (oem.leadTimeDays <= leadTimeRange[1]) {
        score += 40;
      } else if (oem.leadTimeDays <= leadTimeRange[1] * 1.2) {
        // Partial match if within 20% over
        score += 20;
      }
    }

    // Location Match (20% weight)
    totalCriteria += 20;
    if (selectedLocation !== "any" && oem.location) {
      if (oem.location.toLowerCase() === selectedLocation.toLowerCase()) {
        score += 20;
      }
    } else if (selectedLocation === "any") {
      score += 10; // Bonus for flexibility
    }

    return Math.round((score / totalCriteria) * 100);
  };

  // Generate highlight tags based on OEM attributes
  const generateOemTags = (oem: OEMCard): string[] => {
    const tags: string[] = [];

    // Low MOQ friendly
    if (oem.moqMin !== null && oem.moqMin <= 100) {
      tags.push("Low MOQ Friendly");
    }

    // Fast delivery
    if (oem.leadTimeDays !== null && oem.leadTimeDays <= 14) {
      tags.push("Fast Delivery");
    }

    // Eco certifications
    const ecoCerts = ["ISO 14001", "FSC", "Eco-Friendly"];
    if (
      oem.certifications.some((cert) =>
        ecoCerts.some((eco) => cert.includes(eco))
      )
    ) {
      tags.push("Eco Packaging");
    }

    // Highly rated
    if (oem.rating !== null && oem.rating >= 4.5) {
      tags.push("Top Rated");
    }

    // Prototype support
    if (oem.certifications.includes("Prototype")) {
      tags.push("Prototype Ready");
    }

    // Large scale
    if (oem.scale === "Large") {
      tags.push("High Capacity");
    }

    return tags;
  };

  const cardsWithScores = useMemo(() => {
    return cards.map((card) => {
      // Use services from database if available, otherwise fallback to generated tags
      const displayTags =
        card.services && card.services.length > 0
          ? card.services
          : generateOemTags(card);

      return {
        ...card,
        matchScore: calculateMatchingScore(card),
        tags: displayTags,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, moqRange, leadTimeRange, selectedLocation]);

  const filtered = useMemo(() => {
    let list = cardsWithScores.filter((o) => {
      const nameHit = o.name.toLowerCase().includes(search.toLowerCase());

      // MOQ filter: Check if OEM's MOQ range overlaps with the selected range
      const moqHit =
        o.moqMin !== null && o.moqMax !== null
          ? o.moqMin <= moqRange[1] && o.moqMax >= moqRange[0] // Ranges overlap
          : o.moqMin !== null
            ? o.moqMin <= moqRange[1] // OEM min is within filter range
            : true; // No MOQ data, so include it

      const scaleHit =
        selectedScale.length === 0 || selectedScale.includes(o.scale);

      // Location filter
      const locationHit =
        selectedLocation === "any" ||
        !o.location ||
        o.location.toLowerCase() === selectedLocation.toLowerCase();

      // Lead Time filter
      const leadTimeHit =
        o.leadTimeDays === null ||
        (o.leadTimeDays >= leadTimeRange[0] &&
          o.leadTimeDays <= leadTimeRange[1]);

      // Certifications filter: If filters selected, OEM must have ALL selected certs
      const certHit =
        selectedCerts.length === 0 ||
        selectedCerts.every((c) => o.certifications.includes(c));

      // Tags filter: If tags selected, OEM must have AT LEAST ONE selected tag
      const tagHit =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => o.tags?.includes(tag));

      return (
        nameHit &&
        moqHit &&
        scaleHit &&
        locationHit &&
        leadTimeHit &&
        certHit &&
        tagHit
      );
    });

    switch (sortBy) {
      case "best-match":
        // Sort by matching score (highest first)
        list = [...list].sort(
          (a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0)
        );
        break;
      case "ai-rank":
        // Sort by AI ranking (already sorted, but ensure)
        list = [...list].sort((a, b) => (a.aiRank ?? 999) - (b.aiRank ?? 999));
        break;
      case "fastest":
        // For browsing OEMs, sort by rating (highest first)
        list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "lowest-moq":
        list = [...list].sort(
          (a, b) =>
            (a.moqMin ?? Number.MAX_SAFE_INTEGER) -
            (b.moqMin ?? Number.MAX_SAFE_INTEGER)
        );
        break;
      case "highest-rated":
        list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      default:
        break;
    }
    return list;
  }, [
    cardsWithScores,
    search,
    moqRange,
    selectedScale,
    selectedLocation,
    leadTimeRange,
    selectedCerts,
    selectedTags,
    sortBy,
  ]);

  const handleViewProfile = (card: OEMCard) => {
    const target = card.slug ?? card.oemOrgId;
    window.location.href = ROUTES.oemProfile(target);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-12">
          <div className="container mx-auto max-w-3xl text-center">
            <Card className="p-8">
              <h1 className="text-2xl font-semibold mb-3">
                Sign in to view matches
              </h1>
              <p className="text-muted-foreground">
                Please log in to view your personalized OEM matches.
              </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    toast.error(error.message);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-12">
        <div className="container mx-auto">
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">Your OEM Matches</h1>
              {searchMode === "ai" && (
                <Badge className="bg-purple-500 text-white">
                  <Wand2 className="h-3 w-3 mr-1" />
                  AI Powered
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {isLoading
                ? "Finding matching manufacturers..."
                : searchMode === "ai"
                  ? `AI found ${filtered.length} perfect matches for you`
                  : `Found ${filtered.length} manufacturers that match your criteria`}
            </p>
          </div>

          <div className="flex gap-6">
            <aside className="hidden lg:block w-80 space-y-6">
              <Card className="p-6 sticky top-24">
                <div className="flex items-center gap-2 mb-6">
                  <Filter className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Filters</h2>
                </div>

                <div className="space-y-6">
                  {/* MOQ Range - Removed from filter UI, now only from onboarding */}

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Select
                      value={selectedLocation}
                      onValueChange={(value) => setSelectedLocation(value)}
                    >
                      <SelectTrigger id="location">
                        <SelectValue placeholder="Any Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Location</SelectItem>
                        <SelectItem value="thailand">Thailand</SelectItem>
                        <SelectItem value="vietnam">Vietnam</SelectItem>
                        <SelectItem value="china">China</SelectItem>
                        <SelectItem value="sea">Southeast Asia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Lead Time (Days)</Label>
                    <Slider
                      value={leadTimeRange}
                      onValueChange={(v) =>
                        setLeadTimeRange([v[0], v[1]] as [number, number])
                      }
                      min={1}
                      max={90}
                      step={1}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{leadTimeRange[0]} days</span>
                      <span>{leadTimeRange[1]} days</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Scale</Label>
                    <div className="space-y-2">
                      {["Small", "Medium", "Large"].map((scale) => (
                        <div
                          key={scale}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={scale}
                            checked={selectedScale.includes(scale)}
                            onCheckedChange={(checked) => {
                              if (checked)
                                setSelectedScale([...selectedScale, scale]);
                              else
                                setSelectedScale(
                                  selectedScale.filter((s) => s !== scale)
                                );
                            }}
                          />
                          <Label htmlFor={scale} className="cursor-pointer">
                            {scale}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Certifications</Label>
                    <div className="space-y-2">
                      {allCerts.map((cert) => (
                        <div key={cert} className="flex items-center space-x-2">
                          <Checkbox
                            id={cert}
                            checked={selectedCerts.includes(cert)}
                            onCheckedChange={(checked) => {
                              if (checked)
                                setSelectedCerts([...selectedCerts, cert]);
                              else
                                setSelectedCerts(
                                  selectedCerts.filter((c) => c !== cert)
                                );
                            }}
                          />
                          <Label htmlFor={cert} className="cursor-pointer">
                            {cert}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>OEM Highlights</Label>
                    <div className="space-y-2">
                      {availableTags.map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={tag}
                            checked={selectedTags.includes(tag)}
                            onCheckedChange={(checked) => {
                              if (checked)
                                setSelectedTags([...selectedTags, tag]);
                              else
                                setSelectedTags(
                                  selectedTags.filter((t) => t !== tag)
                                );
                            }}
                          />
                          <Label htmlFor={tag} className="cursor-pointer">
                            {tag}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </aside>

            <div className="flex-1 space-y-6">
              <Card className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Search OEMs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="md:w-80"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch("");
                      setSortBy("best-match");
                      setSelectedCerts([]);
                      setSelectedScale([]);
                      setSelectedTags([]);
                      setSelectedLocation("any");
                      // Don't reset moqRange - it comes from onboarding
                      setLeadTimeRange([1, 90]);
                    }}
                  >
                    Reset
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="best-match">Best match</SelectItem>
                      <SelectItem value="lowest-moq">Lowest MOQ</SelectItem>
                      <SelectItem value="highest-rated">
                        Highest rated
                      </SelectItem>
                      <SelectItem value="fastest">
                        Most recent matches
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Card>

              {isLoading ? (
                <Card className="p-12 text-center text-muted-foreground">
                  Loading matches...
                </Card>
              ) : filtered.length === 0 ? (
                <Card className="p-12 text-center">
                  <Factory className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {COPY.pages.oemList.noOEMs}
                  </p>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((oem) => (
                    <Card
                      key={oem.oemOrgId}
                      className="p-6 hover:shadow-lg transition-shadow flex flex-col h-full"
                    >
                      <div className="space-y-4 flex-1">
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg">
                              {oem.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              {oem.aiRank && (
                                <Badge className="bg-purple-500 text-white text-xs">
                                  #{oem.aiRank}
                                </Badge>
                              )}
                              {oem.scale === "Large" ? (
                                <Factory className="h-5 w-5 text-primary" />
                              ) : (
                                <Home className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="scale">{oem.scale}</Badge>
                            <Badge
                              variant={getVerifiedBadgeVariant("Verified")}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Match
                            </Badge>
                            {oem.aiScore ? (
                              <Badge
                                variant="outline"
                                className="text-purple-600 border-purple-300"
                              >
                                <Sparkles className="h-3 w-3 mr-1" />
                                {oem.aiScore}% Match
                              </Badge>
                            ) : oem.matchScore && oem.matchScore >= 70 ? (
                              <Badge
                                variant="outline"
                                className={
                                  oem.matchScore >= 90
                                    ? "text-green-700 border-green-400 bg-green-50"
                                    : oem.matchScore >= 80
                                      ? "text-blue-700 border-blue-400 bg-blue-50"
                                      : "text-orange-700 border-orange-400 bg-orange-50"
                                }
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {oem.matchScore}% Fit
                              </Badge>
                            ) : null}
                          </div>
                        </div>

                        {/* OEM Highlight Tags */}
                        {oem.tags && oem.tags.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap">
                            {oem.tags.map((tag, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs bg-gradient-to-r from-primary/10 to-primary/5 text-primary border-primary/20"
                              >
                                <Sparkles className="h-2.5 w-2.5 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {oem.matchReasons && oem.matchReasons.length > 0 && (
                          <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Wand2 className="h-3.5 w-3.5 text-purple-600" />
                              <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">
                                AI Match Reasons
                              </span>
                            </div>
                            <ul className="space-y-1">
                              {oem.matchReasons.map((reason, idx) => (
                                <li
                                  key={idx}
                                  className="text-xs text-purple-800 dark:text-purple-300 flex items-start gap-1.5"
                                >
                                  <CheckCircle2 className="h-3 w-3 text-purple-600 mt-0.5 shrink-0" />
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {oem.location ?? "Location TBD"}
                          {oem.crossBorder && (
                            <Badge variant="outline" className="ml-2">
                              <Globe className="h-3 w-3 mr-1" />
                              Cross-border
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">MOQ:</span>
                          <span className="font-semibold">
                            {oem.moqMin !== null
                              ? oem.moqMin.toLocaleString()
                              : "N/A"}
                            {oem.moqMax
                              ? ` - ${oem.moqMax.toLocaleString()}`
                              : oem.moqMin !== null
                                ? "+"
                                : ""}
                          </span>
                        </div>

                        {oem.rating !== null && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Star className="h-4 w-4 fill-primary text-primary" />
                            <span className="font-semibold text-foreground">
                              {oem.rating.toFixed(1)}
                            </span>
                            <span>({oem.totalReviews ?? 0} reviews)</span>
                          </div>
                        )}

                        {oem.certifications.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {oem.certifications.slice(0, 3).map((cert) => (
                              <Badge
                                key={cert}
                                variant="secondary"
                                className="text-xs"
                              >
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 mt-auto pt-4">
                        <Button
                          onClick={() => handleViewProfile(oem)}
                          className="w-full"
                        >
                          {COPY.ctas.viewProfile}
                        </Button>
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={ROUTES.requestQuote(oem.oemOrgId)}>
                            <Rocket className="h-4 w-4 mr-2" />
                            {COPY.ctas.requestQuote}
                          </Link>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {filtered.length === 0 && !isLoading && (
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
      </div>
    </div>
  );
}
