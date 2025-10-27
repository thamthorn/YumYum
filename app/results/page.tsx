"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
import { OEMS, ROUTES, getVerifiedBadgeVariant } from "@/data/MockData";
import {
  Factory,
  Home,
  MapPin,
  Star,
  Filter,
  ArrowUpDown,
  Building2,
  Globe,
  Rocket,
} from "lucide-react";

export default function Results() {
  // Filters / sorting state
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("best-match");
  const [moqRange, setMoqRange] = useState<[number, number]>([50, 10000]);
  const [selectedScale, setSelectedScale] = useState<string[]>([]);
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);

  const allCerts = useMemo(() => {
    const set = new Set<string>();
    OEMS.forEach((o) => o.certifications.forEach((c) => set.add(c.name)));
    return Array.from(set);
  }, []);

  const filtered = useMemo(() => {
    let list = OEMS.filter((o) => {
      const nameHit = o.name.toLowerCase().includes(search.toLowerCase());
      const moqHit =
        o.moqMin >= moqRange[0] && (o.moqMax ?? 100000) <= moqRange[1]
          ? true
          : o.moqMin <= moqRange[1];
      const scaleHit =
        selectedScale.length === 0 || selectedScale.includes(o.scale);
      const certHit =
        selectedCerts.length === 0 ||
        selectedCerts.every((c) =>
          o.certifications.some((cc) => cc.name === c)
        );
      return nameHit && moqHit && scaleHit && certHit;
    });

    switch (sortBy) {
      case "fastest":
        list = [...list].sort(
          (a, b) => (a.leadTime ?? 999) - (b.leadTime ?? 999)
        );
        break;
      case "lowest-moq":
        list = [...list].sort((a, b) => a.moqMin - b.moqMin);
        break;
      case "highest-rated":
        list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      default:
        // best-match: keep original mock order
        break;
    }
    return list;
  }, [search, moqRange, selectedScale, selectedCerts, sortBy]);

  const getScaleBadge = (scale: string) => {
    if (scale === "Large") {
      return (
        <Badge variant="scale" className="flex items-center gap-1">
          <Factory className="h-3 w-3" /> Factory-grade
        </Badge>
      );
    }
    if (scale === "Small") {
      return (
        <Badge variant="scale" className="flex items-center gap-1">
          <Home className="h-3 w-3" /> Home-based
        </Badge>
      );
    }
    return (
      <Badge variant="scale" className="flex items-center gap-1">
        <Building2 className="h-3 w-3" /> Medium
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-12">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold mb-2">Your OEM Matches</h1>
            <p className="text-muted-foreground">
              Found {filtered.length} verified manufacturers that match your
              criteria
            </p>
          </div>

          <div className="flex gap-6">
            {/* Sidebar Filters - Desktop */}
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

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSearch("");
                      setMoqRange([50, 10000]);
                      setSelectedScale([]);
                      setSelectedCerts([]);
                      setSortBy("best-match");
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              </Card>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 flex gap-2">
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search manufacturers..."
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-48">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Best Match" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="best-match">Best Match</SelectItem>
                    <SelectItem value="fastest">Fastest Lead Time</SelectItem>
                    <SelectItem value="lowest-moq">Lowest MOQ</SelectItem>
                    <SelectItem value="highest-rated">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* OEM Cards */}
              <div className="space-y-4">
                {filtered.map((oem) => (
                  <Card
                    key={oem.id}
                    className="p-6 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Logo/Icon */}
                      <div className="shrink-0">
                        <div className="h-20 w-20 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Factory className="h-10 w-10 text-primary" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-4">
                        <div>
                          <div className="flex flex-wrap items-start gap-2 mb-2">
                            <h3 className="text-xl font-semibold">
                              {oem.name}
                            </h3>
                            <Badge
                              variant={getVerifiedBadgeVariant(
                                oem.verification
                              )}
                            >
                              {oem.verification === "Trusted Partner"
                                ? "✨ Trusted Partner"
                                : oem.verification === "Certified"
                                  ? "✓ Certified"
                                  : "✓ Verified"}
                            </Badge>
                            {getScaleBadge(oem.scale)}
                          </div>
                          <p className="text-muted-foreground">
                            {oem.shortDescription}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">
                              MOQ
                            </div>
                            <div className="font-semibold">
                              {oem.moqMin}–{oem.moqMax || "50k"}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Lead Time
                            </div>
                            <div className="font-semibold">
                              {oem.leadTime || 30} days
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Response
                            </div>
                            <div className="font-semibold">
                              {oem.responseTime || 24}h avg
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Rating
                            </div>
                            <div className="font-semibold flex items-center gap-1">
                              <Star className="h-4 w-4 fill-primary text-primary" />
                              {oem.rating || 4.5}
                            </div>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <MapPin className="h-3 w-3" /> {oem.location}
                          </Badge>
                          {oem.crossBorder && (
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <Globe className="h-3 w-3" /> Cross-border
                            </Badge>
                          )}
                          {oem.prototypeSupport && (
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <Rocket className="h-3 w-3" /> Prototype
                            </Badge>
                          )}
                          {oem.certifications.slice(0, 3).map((cert) => (
                            <Badge key={cert.name} variant="outline">
                              {cert.name}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex lg:flex-col gap-2 lg:w-40">
                        <Button className="flex-1" asChild>
                          <Link href={ROUTES.oemProfile(oem.id)}>
                            View Profile
                          </Link>
                        </Button>
                        <Button variant="outline" className="flex-1" asChild>
                          <Link href={ROUTES.requestQuote(oem.id)}>
                            Request Quote
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
