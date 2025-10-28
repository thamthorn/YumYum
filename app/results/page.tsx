"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
} from "lucide-react";
import { useSupabase } from "@/lib/supabase/session-context";
import { toast } from "sonner";

type MatchResponse = {
  id: string;
  status: string;
  score: number | null;
  createdAt: string | null;
  oem: {
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
    certifications: string[];
  } | null;
};

type MatchCard = {
  matchId: string;
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
  certifications: string[];
  createdAt: string | null;
};

export default function Results() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("best-match");
  const [moqRange, setMoqRange] = useState<[number, number]>([50, 10000]);
  const [selectedScale, setSelectedScale] = useState<string[]>([]);
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const { session } = useSupabase();

  const {
    data: matches = [],
    isLoading,
    error,
  } = useQuery<MatchResponse[]>({
    queryKey: ["buyer-matches"],
    queryFn: async () => {
      const response = await fetch("/api/matches");
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Unable to load matches");
      }
      const body = (await response.json()) as { data: MatchResponse[] };
      return body.data ?? [];
    },
    enabled: Boolean(session),
  });

  const cards: MatchCard[] = useMemo(() => {
    return matches
      .filter((match) => match.oem !== null)
      .map((match) => {
        const oem = match.oem!;
        const scale =
          oem.scale === "large"
            ? "Large"
            : oem.scale === "small"
              ? "Small"
              : "Medium";
        return {
          matchId: match.id,
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
          certifications: oem.certifications,
          createdAt: match.createdAt,
        };
      });
  }, [matches]);

  const allCerts = useMemo(() => {
    const set = new Set<string>();
    cards.forEach((card) =>
      card.certifications.forEach((cert) => set.add(cert))
    );
    return Array.from(set);
  }, [cards]);

  const filtered = useMemo(() => {
    let list = cards.filter((o) => {
      const nameHit = o.name.toLowerCase().includes(search.toLowerCase());
      const moqHit =
        o.moqMin !== null && o.moqMax !== null
          ? o.moqMin >= moqRange[0] && o.moqMax <= moqRange[1]
          : o.moqMin !== null
            ? o.moqMin <= moqRange[1]
            : true;
      const scaleHit =
        selectedScale.length === 0 || selectedScale.includes(o.scale);
      const certHit =
        selectedCerts.length === 0 ||
        selectedCerts.every((c) => o.certifications.includes(c));
      return nameHit && moqHit && scaleHit && certHit;
    });

    switch (sortBy) {
      case "fastest":
        list = [...list].sort(
          (a, b) =>
            (a.createdAt ? new Date(a.createdAt).getTime() : Infinity) -
            (b.createdAt ? new Date(b.createdAt).getTime() : Infinity)
        );
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
  }, [cards, search, moqRange, selectedScale, selectedCerts, sortBy]);

  const handleViewProfile = (card: MatchCard) => {
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
            <h1 className="text-4xl font-bold mb-2">Your OEM Matches</h1>
            <p className="text-muted-foreground">
              {isLoading
                ? "Finding matching manufacturers..."
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
                  <div className="space-y-2">
                    <Label>MOQ Range</Label>
                    <Slider
                      value={moqRange}
                      onValueChange={(v) =>
                        setMoqRange([v[0], v[1]] as [number, number])
                      }
                      min={50}
                      max={10000}
                      step={50}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{moqRange[0]}</span>
                      <span>{moqRange[1]}</span>
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
                      setMoqRange([50, 10000]);
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
                      key={oem.matchId}
                      className="p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="space-y-4">
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
                            <Badge variant="scale">{oem.scale}</Badge>
                            <Badge
                              variant={getVerifiedBadgeVariant(
                                "Verified"
                              )}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Match
                            </Badge>
                          </div>
                        </div>

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
                            <span>
                              ({oem.totalReviews ?? 0} reviews)
                            </span>
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

                        <Button
                          onClick={() => handleViewProfile(oem)}
                          className="w-full"
                        >
                          {COPY.ctas.viewProfile}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          asChild
                        >
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
