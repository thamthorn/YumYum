import { useState } from "react";
import { TierBadge } from "@/components/TierBadge";
import { cn } from "@/lib/utils";
import type { SubscriptionTier, Subscription } from "@/types/platform";
import { TIER_FEATURES } from "@/types/platform";

interface SubscriptionCardProps {
  tier: SubscriptionTier;
  currentTier?: SubscriptionTier;
  subscription?: Subscription;
  onSelect?: (tier: SubscriptionTier) => void;
  isAnnual?: boolean;
}

const tierPricing = {
  FREE: { monthly: 0, annual: 0 },
  INSIGHTS: { monthly: 2999, annual: 29990 },
  VERIFIED_PARTNER: { monthly: 9999, annual: 99990 },
};

const tierDescriptions = {
  FREE: "เริ่มต้นขายบน YumYum ฟรี ไม่มีค่าใช้จ่าย",
  INSIGHTS: "ดู Analytics และติดต่อลูกค้าได้ไม่จำกัด",
  VERIFIED_PARTNER: "สิทธิพิเศษเต็มรูปแบบ รับการตรวจสอบโรงงาน และเพิ่มโอกาสขาย",
};

export function SubscriptionCard({
  tier,
  currentTier,
  subscription,
  onSelect,
  isAnnual = false,
}: SubscriptionCardProps) {
  // Map canonical tier features to the UI shape expected by this component
  const tierInfo = TIER_FEATURES[tier];
  const features = {
    // boolean feature flags
    canCreateProfile: tierInfo.features.basicListing,
    canListProducts: tierInfo.features.productCatalog,
    canReceiveLeads: tierInfo.features.profileViews,
    canViewAnalytics:
      tierInfo.features.keywordInsights || tierInfo.features.profileViews,
    canContactBuyers: tier === "INSIGHTS" || tier === "VERIFIED_PARTNER",
    showVerifiedBadge: tierInfo.features.verifiedBadge,
    canUploadMedia:
      tierInfo.features.factoryTourVideo || tierInfo.features.qcVideo,
    canRequestInspection: tierInfo.features.factoryInspection,
    priorityInSearch: tierInfo.features.rankBoost,
    // limits (reasonable defaults mapped per tier)
    maxProductImages: tier === "FREE" ? 3 : tier === "INSIGHTS" ? 20 : 999,
    maxMonthlyLeads: tier === "FREE" ? 0 : tier === "INSIGHTS" ? 100 : 999,
    maxBuyerContacts: tier === "FREE" ? 3 : tier === "INSIGHTS" ? 50 : 999,
  } as const;
  const pricing = tierPricing[tier];
  const price = isAnnual ? pricing.annual : pricing.monthly;
  const isCurrent = currentTier === tier;
  const isUpgrade = currentTier && tier > currentTier;
  const isPopular = tier === "INSIGHTS";

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border-2 bg-white p-6 transition-all",
        isCurrent && "border-green-500 ring-4 ring-green-100",
        !isCurrent && isUpgrade && "border-gray-200 hover:border-green-300",
        tier === "VERIFIED_PARTNER" &&
          "bg-gradient-to-br from-green-50 to-white"
      )}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-1 text-xs font-semibold text-white shadow-lg">
            Most Popular
          </span>
        </div>
      )}

      {/* Current Badge */}
      {isCurrent && (
        <div className="absolute -top-3 right-6">
          <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
            Current Plan
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-4">
        <TierBadge tier={tier} size="lg" className="mb-2" />
        <p className="mt-2 text-sm text-gray-600">{tierDescriptions[tier]}</p>
      </div>

      {/* Pricing */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-gray-900">
            ฿{price.toLocaleString()}
          </span>
          {tier !== "FREE" && (
            <span className="text-sm text-gray-500">
              /{isAnnual ? "year" : "month"}
            </span>
          )}
        </div>
        {tier !== "FREE" && isAnnual && (
          <p className="mt-1 text-sm text-green-600">
            Save ฿{((pricing.monthly * 12 - pricing.annual) / 1000).toFixed(1)}
            k/year
          </p>
        )}
      </div>

      {/* Features */}
      <div className="mb-6 flex-1 space-y-3">
        <div className="space-y-2">
          <FeatureItem enabled={features.canCreateProfile}>
            Create OEM Profile
          </FeatureItem>
          <FeatureItem enabled={features.canListProducts}>
            List Products
          </FeatureItem>
          <FeatureItem enabled={features.canReceiveLeads}>
            Receive Buyer Leads
          </FeatureItem>
          <FeatureItem enabled={features.canViewAnalytics}>
            View Analytics Dashboard
          </FeatureItem>
          <FeatureItem enabled={features.canContactBuyers}>
            Contact Buyers Directly
          </FeatureItem>
          <FeatureItem enabled={features.showVerifiedBadge}>
            Verified Partner Badge
          </FeatureItem>
          <FeatureItem enabled={features.canUploadMedia}>
            Factory Tour Videos
          </FeatureItem>
          <FeatureItem enabled={features.canRequestInspection}>
            On-site Inspection
          </FeatureItem>
          <FeatureItem enabled={features.priorityInSearch}>
            Priority in Search Results
          </FeatureItem>
        </div>

        {/* Limits */}
        <div className="border-t pt-3 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Product Images:</span>
            <span className="font-medium">
              {features.maxProductImages === 999
                ? "Unlimited"
                : features.maxProductImages}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Monthly Leads:</span>
            <span className="font-medium">
              {features.maxMonthlyLeads === 999
                ? "Unlimited"
                : features.maxMonthlyLeads}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Buyer Contacts:</span>
            <span className="font-medium">
              {features.maxBuyerContacts === 999
                ? "Unlimited"
                : features.maxBuyerContacts}
            </span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={() => onSelect?.(tier)}
        disabled={isCurrent}
        className={cn(
          "w-full rounded-lg px-6 py-3 font-semibold transition-all",
          isCurrent && "cursor-not-allowed bg-gray-100 text-gray-500",
          !isCurrent &&
            tier === "FREE" &&
            "bg-gray-900 text-white hover:bg-gray-800",
          !isCurrent &&
            tier === "INSIGHTS" &&
            "bg-blue-600 text-white hover:bg-blue-700",
          !isCurrent &&
            tier === "VERIFIED_PARTNER" &&
            "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg"
        )}
      >
        {isCurrent ? "Current Plan" : isUpgrade ? "Upgrade Now" : "Select Plan"}
      </button>

      {/* Subscription Info */}
      {isCurrent && subscription && (
        <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Status:</span>
            <span
              className={cn(
                "font-medium",
                subscription.status === "ACTIVE" && "text-green-600",
                subscription.status === "CANCELLED" && "text-red-600"
              )}
            >
              {subscription.status}
            </span>
          </div>
          {subscription.current_period_end && (
            <div className="flex justify-between">
              <span>Renews on:</span>
              <span className="font-medium">
                {new Date(subscription.current_period_end).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FeatureItem({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      {enabled ? (
        <svg
          className="h-5 w-5 shrink-0 text-green-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg
          className="h-5 w-5 shrink-0 text-gray-300"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      )}
      <span
        className={cn("text-sm", enabled ? "text-gray-700" : "text-gray-400")}
      >
        {children}
      </span>
    </div>
  );
}

interface SubscriptionComparisonProps {
  currentTier?: SubscriptionTier;
  subscription?: Subscription;
  onSelectTier: (tier: SubscriptionTier) => void;
}

export function SubscriptionComparison({
  currentTier,
  subscription,
  onSelectTier,
}: SubscriptionComparisonProps) {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="space-y-6">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span
          className={cn(
            "text-sm font-medium",
            !isAnnual ? "text-gray-900" : "text-gray-500"
          )}
        >
          Monthly
        </span>
        <button
          onClick={() => setIsAnnual(!isAnnual)}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
            isAnnual ? "bg-green-600" : "bg-gray-300"
          )}
          role="switch"
          aria-checked={isAnnual}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
              isAnnual ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium",
              isAnnual ? "text-gray-900" : "text-gray-500"
            )}
          >
            Annual
          </span>
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
            Save up to 17%
          </span>
        </div>
      </div>

      {/* Subscription Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <SubscriptionCard
          tier="FREE"
          currentTier={currentTier}
          subscription={currentTier === "FREE" ? subscription : undefined}
          onSelect={onSelectTier}
          isAnnual={isAnnual}
        />
        <SubscriptionCard
          tier="INSIGHTS"
          currentTier={currentTier}
          subscription={currentTier === "INSIGHTS" ? subscription : undefined}
          onSelect={onSelectTier}
          isAnnual={isAnnual}
        />
        <SubscriptionCard
          tier="VERIFIED_PARTNER"
          currentTier={currentTier}
          subscription={
            currentTier === "VERIFIED_PARTNER" ? subscription : undefined
          }
          onSelect={onSelectTier}
          isAnnual={isAnnual}
        />
      </div>
    </div>
  );
}
