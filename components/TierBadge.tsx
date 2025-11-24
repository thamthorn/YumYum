import { cn } from "@/lib/utils";
import type { SubscriptionTier } from "@/types/platform";
import { Crown, BarChart3, CheckCircle2, ShieldCheck } from "lucide-react";

interface TierBadgeProps {
  tier: SubscriptionTier;
  className?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const sizeStyles = {
  sm: "text-xs px-2.5 py-1",
  md: "text-sm px-3 py-1.5",
  lg: "text-base px-4 py-2",
};

const iconSizes = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function TierBadge({
  tier,
  className,
  size = "md",
  showIcon = true,
}: TierBadgeProps) {
  if (tier === "FREE") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full font-medium bg-white/90 text-gray-600 backdrop-blur-sm border border-gray-200/50 shadow-sm",
          sizeStyles[size],
          className
        )}
      >
        {showIcon && <span className={cn("rounded-full bg-gray-500/10 p-0.5", iconSizes[size])} />} 
        <span>Free</span>
      </span>
    );
  }

  if (tier === "INSIGHTS") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full font-medium bg-orange-50 text-orange-600 border border-orange-200",
          sizeStyles[size],
          className
        )}
      >
        {showIcon && <BarChart3 className={iconSizes[size]} />}
        <span>Insights</span>
      </span>
    );
  }

  if (tier === "VERIFIED_PARTNER") {
    return <VerifiedBadge className={className} size={size} />;
  }

  return null;
}

export function VerifiedBadge({ 
  className,
  size = "md" 
}: { 
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 font-semibold text-white shadow-lg shadow-orange-500/30 ring-1 ring-white/20 backdrop-blur-md",
        sizeStyles[size],
        className
      )}
    >
      <ShieldCheck className={cn(iconSizes[size], "text-white")} />
      <span>Verified Partner</span>
    </div>
  );
}
