import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SubscriptionTier, CertificationType } from "@/types/platform";

export interface OEMFilterState {
  search: string;
  categories: string[];
  tiers: SubscriptionTier[];
  certifications: CertificationType[];
  moqRange: [number, number];
  leadTimeRange: [number, number];
  location: string[];
  hasRnD: boolean;
  hasPackaging: boolean;
  hasFormulaLibrary: boolean;
  hasWhiteLabel: boolean;
  canExport: boolean;
}

interface OEMFiltersProps {
  filters: OEMFilterState;
  onChange: (filters: OEMFilterState) => void;
  onReset: () => void;
  availableCategories?: string[];
  availableLocations?: string[];
}

export function OEMFilters({
  filters,
  onChange,
  onReset,
  availableCategories = [],
  availableLocations = [],
}: OEMFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = <K extends keyof OEMFilterState>(
    key: K,
    value: OEMFilterState[K]
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleArrayValue = <K extends keyof OEMFilterState>(
    key: K,
    value: string
  ) => {
    const current = filters[key] as string[];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, updated as OEMFilterState[K]);
  };

  const activeFilterCount = [
    filters.categories.length,
    filters.tiers.length,
    filters.certifications.length,
    filters.location.length,
    filters.hasRnD ? 1 : 0,
    filters.hasPackaging ? 1 : 0,
    filters.hasFormulaLibrary ? 1 : 0,
    filters.hasWhiteLabel ? 1 : 0,
    filters.canExport ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-xl border bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={onReset}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Reset all
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-lg p-2 hover:bg-gray-100"
            aria-label={isExpanded ? "Collapse filters" : "Expand filters"}
          >
            <svg
              className={cn(
                "h-5 w-5 transition-transform",
                isExpanded && "rotate-180"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mt-4">
        <input
          type="text"
          placeholder="Search OEM name..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Expandable Filters */}
      {isExpanded && (
        <div className="mt-6 space-y-6">
          {/* Tier Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Subscription Tier
            </label>
            <div className="flex flex-wrap gap-2">
              {(
                ["FREE", "INSIGHTS", "VERIFIED_PARTNER"] as SubscriptionTier[]
              ).map((tier) => (
                <button
                  key={tier}
                  onClick={() => toggleArrayValue("tiers", tier)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                    filters.tiers.includes(tier)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {tier === "FREE"
                    ? "Free"
                    : tier === "INSIGHTS"
                      ? "Insights"
                      : "Verified Partner"}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          {availableCategories.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Product Categories
              </label>
              <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
                {availableCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleArrayValue("categories", category)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                      filters.categories.includes(category)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Certifications
            </label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  "GMP",
                  "HACCP",
                  "ISO22000",
                  "HALAL",
                  "ORGANIC",
                  "FDA",
                  "FSSC22000",
                  "BRC",
                  "OTHER",
                ] as CertificationType[]
              ).map((cert) => (
                <button
                  key={cert}
                  onClick={() => toggleArrayValue("certifications", cert)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                    filters.certifications.includes(cert)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {cert}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          {availableLocations.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Location
              </label>
              <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
                {availableLocations.map((location) => (
                  <button
                    key={location}
                    onClick={() => toggleArrayValue("location", location)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                      filters.location.includes(location)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MOQ Range */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              MOQ Range (units)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                placeholder="Min"
                value={filters.moqRange[0] || ""}
                onChange={(e) =>
                  updateFilter("moqRange", [
                    parseInt(e.target.value) || 0,
                    filters.moqRange[1],
                  ])
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.moqRange[1] || ""}
                onChange={(e) =>
                  updateFilter("moqRange", [
                    filters.moqRange[0],
                    parseInt(e.target.value) || 999999,
                  ])
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Lead Time Range */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Lead Time Range (days)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                placeholder="Min"
                value={filters.leadTimeRange[0] || ""}
                onChange={(e) =>
                  updateFilter("leadTimeRange", [
                    parseInt(e.target.value) || 0,
                    filters.leadTimeRange[1],
                  ])
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.leadTimeRange[1] || ""}
                onChange={(e) =>
                  updateFilter("leadTimeRange", [
                    filters.leadTimeRange[0],
                    parseInt(e.target.value) || 365,
                  ])
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Capabilities
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "hasRnD", label: "R&D Support" },
                { key: "hasPackaging", label: "Packaging Design" },
                { key: "hasFormulaLibrary", label: "Formula Library" },
                { key: "hasWhiteLabel", label: "White Label" },
                { key: "canExport", label: "Export Capabilities" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() =>
                    updateFilter(
                      key as keyof OEMFilterState,
                      !filters[key as keyof OEMFilterState]
                    )
                  }
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                    filters[key as keyof OEMFilterState]
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function useOEMFilters(initialFilters?: Partial<OEMFilterState>) {
  const defaultFilters: OEMFilterState = {
    search: "",
    categories: [],
    tiers: [],
    certifications: [],
    moqRange: [0, 999999],
    leadTimeRange: [0, 365],
    location: [],
    hasRnD: false,
    hasPackaging: false,
    hasFormulaLibrary: false,
    hasWhiteLabel: false,
    canExport: false,
    ...initialFilters,
  };

  const [filters, setFilters] = useState<OEMFilterState>(defaultFilters);

  const reset = () => setFilters(defaultFilters);

  return { filters, setFilters, reset };
}
