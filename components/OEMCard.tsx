"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { TierBadge, VerifiedBadge } from "@/components/TierBadge";
import { cn } from "@/lib/utils";
import type { OEMCardData, MatchScore } from "@/types/platform";

interface OEMCardProps {
  oem: OEMCardData;
  matchScore?: MatchScore;
  variant?: "list" | "grid";
  showBookmark?: boolean;
  isBookmarked?: boolean;
  onBookmark?: (oemId: string) => void;
  onClick?: (oemId: string) => Promise<void> | void;
}

export function OEMCard({
  oem,
  matchScore,
  variant = "grid",
  showBookmark = true,
  isBookmarked = false,
  onBookmark,
  onClick,
}: OEMCardProps) {
  const isList = variant === "list";
  // Normalize DB -> UI shape (DB uses snake_case) so UI can use camelCase safely
  const uiOem = {
    id:
      (oem as any).id ??
      (oem as any).organization_id ??
      (oem as any).organizationId ??
      (oem as any).oem_org_id ??
      (oem as any).org_id ??
      (oem as any).slug,
    companyName: (oem as any).company_name ?? (oem as any).companyName ?? "",
    location: (oem as any).location ?? "",
    logo: (oem as any).logo ?? "",
    slug: (oem as any).slug ?? "",
    categories: (oem as any).categories ?? [],
    moq: (oem as any).moq ?? (oem as any).moq_minimum ?? null,
    leadTime: (oem as any).lead_time ?? (oem as any).leadTime ?? null,
    productCount: (oem as any).product_count ?? (oem as any).productCount ?? 0,
    certifications: (oem as any).certifications ?? [],
    tier: (oem as any).tier ?? "FREE",
  } as const;

  const uiMatchScore = matchScore
    ? {
        totalScore:
          (matchScore as any).total_score ??
          (matchScore as any).totalScore ??
          0,
        categoryScore:
          (matchScore as any).category_score ??
          (matchScore as any).categoryScore ??
          0,
        moqScore:
          (matchScore as any).moq_score ?? (matchScore as any).moqScore ?? 0,
        leadTimeScore:
          (matchScore as any).lead_time_score ??
          (matchScore as any).leadTimeScore ??
          0,
        certificationsScore:
          (matchScore as any).certification_score ??
          (matchScore as any).certificationsScore ??
          0,
      }
    : undefined;

  const href = `/oem/${uiOem.slug}`;

  const handleClick = () => {
    if (onClick) {
      // Fire and forget analytics - don't block navigation
      Promise.resolve(onClick(uiOem.id as string)).catch((err) =>
        console.error("OEM click handler error", err)
      );
    }
    // Allow default Link behavior to proceed immediately
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        "group relative flex overflow-hidden rounded-xl border bg-white transition-all hover:shadow-xl",
        isList ? "flex-row gap-6 p-6" : "flex-col"
      )}
    >
      {/* Image */}
      <div
        className={cn(
          "relative overflow-hidden bg-gray-100",
          isList ? "h-48 w-64 shrink-0 rounded-lg" : "h-56 w-full"
        )}
      >
        {uiOem.logo ? (
          <Image
            src={uiOem.logo}
            alt={uiOem.companyName}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <svg
              className="h-16 w-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
        )}

        {/* Tier Badge Overlay */}
        <div className="absolute left-3 top-3">
          <TierBadge tier={uiOem.tier as any} size="sm" />
        </div>

        {/* Match Score Overlay */}
        {uiMatchScore && (
          <div className="absolute bottom-3 right-3 rounded-lg bg-black/70 px-3 py-1.5 backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-bold text-white">
                {uiMatchScore.totalScore}%
              </span>
              <span className="text-xs text-gray-300">match</span>
            </div>
          </div>
        )}

        {/* Bookmark Button */}
        {showBookmark && (
          <button
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            onClick={(e) => {
              e.preventDefault();
              onBookmark?.(uiOem.id as string);
            }}
            className="absolute right-3 top-3 rounded-full bg-white/90 p-2 backdrop-blur-sm transition-colors hover:bg-white"
          >
            <svg
              className={cn(
                "h-5 w-5 transition-colors",
                isBookmarked ? "fill-primary text-primary" : "text-gray-600"
              )}
              fill={isBookmarked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div
        className={cn("flex flex-1 flex-col", isList ? "gap-3" : "gap-3 p-5")}
      >
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary">
            {uiOem.companyName}
          </h3>
          <p className="mt-1 text-sm text-gray-600">{uiOem.location}</p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {uiOem.categories.slice(0, 3).map((category: string) => (
            <span
              key={category}
              className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
            >
              {category}
            </span>
          ))}
          {uiOem.categories.length > 3 && (
            <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
              +{uiOem.categories.length - 3}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="mt-auto grid grid-cols-3 gap-4 border-t pt-3">
          <div>
            <p className="text-xs text-gray-500">MOQ</p>
            <p className="mt-0.5 text-sm font-semibold text-gray-900">
              {uiOem.moq?.toLocaleString?.() ?? "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Lead Time</p>
            <p className="mt-0.5 text-sm font-semibold text-gray-900">
              {uiOem.leadTime ?? "N/A"} days
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Products</p>
            <p className="mt-0.5 text-sm font-semibold text-gray-900">
              {uiOem.productCount}
            </p>
          </div>
        </div>

        {/* Certifications */}
        {uiOem.certifications.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {uiOem.certifications.map((cert: string) => (
              <span
                key={cert}
                className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
              >
                {cert}
              </span>
            ))}
          </div>
        )}

        {/* Match Score Breakdown (only if match score exists) */}
        {uiMatchScore && isList && (
          <div className="mt-2 space-y-1">
            <p className="text-xs font-medium text-gray-700">
              Match Breakdown:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="font-medium">
                  {uiMatchScore.categoryScore}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>MOQ:</span>
                <span className="font-medium">{uiMatchScore.moqScore}%</span>
              </div>
              <div className="flex justify-between">
                <span>Lead Time:</span>
                <span className="font-medium">
                  {uiMatchScore.leadTimeScore}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Certifications:</span>
                <span className="font-medium">
                  {uiMatchScore.certificationsScore}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

interface OEMCardListProps {
  oems: any[];
  matchScores?: Record<string, MatchScore>;
  variant?: "list" | "grid";
  showBookmarks?: boolean;
  bookmarkedOEMs?: string[];
  onBookmark?: (oemId: string) => void;
  onOEMClick?: (oemId: string) => Promise<void> | void;
  emptyMessage?: string;
}

export function OEMCardList({
  oems,
  matchScores,
  variant = "grid",
  showBookmarks = true,
  bookmarkedOEMs = [],
  onBookmark,
  onOEMClick,
  emptyMessage = "No OEMs found",
}: OEMCardListProps) {
  if (oems.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        variant === "grid"
          ? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          : "space-y-4"
      )}
    >
      {oems.map((oem) => (
        <OEMCard
          key={(oem as any).id ?? (oem as any).organization_id ?? oem.slug}
          oem={oem}
          matchScore={
            matchScores?.[
              (oem as any).id ?? (oem as any).organization_id ?? oem.slug
            ]
          }
          variant={variant}
          showBookmark={showBookmarks}
          isBookmarked={bookmarkedOEMs.includes(
            (oem as any).id ?? (oem as any).organization_id ?? oem.slug
          )}
          onBookmark={onBookmark}
          onClick={typeof onOEMClick === "function" ? onOEMClick : undefined}
        />
      ))}
    </div>
  );
}
