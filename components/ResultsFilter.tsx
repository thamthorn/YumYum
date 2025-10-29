"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, ChevronDown, ChevronUp } from "lucide-react";

interface ResultsFilterProps {
  moqRange: [number, number];
  setMoqRange: (range: [number, number]) => void;
  selectedScale: string[];
  setSelectedScale: (scale: string[]) => void;
  selectedCerts: string[];
  setSelectedCerts: (certs: string[]) => void;
  allCerts: string[];
  onReset: () => void;
}

export default function ResultsFilter({
  moqRange,
  setMoqRange,
  selectedScale,
  setSelectedScale,
  selectedCerts,
  setSelectedCerts,
  allCerts,
  onReset,
}: ResultsFilterProps) {
  const [showAllCerts, setShowAllCerts] = useState(false);
  const displayedCerts = showAllCerts ? allCerts : allCerts.slice(0, 4);

  return (
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
                <div key={scale} className="flex items-center space-x-2">
                  <Checkbox
                    id={scale}
                    checked={selectedScale.includes(scale)}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedScale([...selectedScale, scale]);
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
              {displayedCerts.map((cert) => (
                <div key={cert} className="flex items-center space-x-2">
                  <Checkbox
                    id={cert}
                    checked={selectedCerts.includes(cert)}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedCerts([...selectedCerts, cert]);
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
            {allCerts.length > 4 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-primary hover:text-primary hover:bg-primary/10"
                onClick={() => setShowAllCerts(!showAllCerts)}
              >
                {showAllCerts ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show All ({allCerts.length})
                  </>
                )}
              </Button>
            )}
          </div>

          <Button variant="outline" className="w-full" onClick={onReset}>
            Reset Filters
          </Button>
        </div>
      </Card>
    </aside>
  );
}
