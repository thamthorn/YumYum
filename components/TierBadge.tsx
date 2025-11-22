import { cn } from "@/lib/utils";
import type { SubscriptionTier } from "@/types/platform";

interface TierBadgeProps {
  tier: SubscriptionTier;
  className?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const tierStyles: Record<
  SubscriptionTier,
  {
    bg: string;
    text: string;
    border: string;
    icon: string;
    label: string;
  }
> = {
  FREE: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-300",
    icon: "",
    label: "Free",
  },
  INSIGHTS: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-300",
    icon: "📊",
    label: "Insights",
  },
  VERIFIED_PARTNER: {
    bg: "bg-gradient-to-r from-green-500 to-emerald-600",
    text: "text-white",
    border: "border-green-400",
    icon: "✅",
    label: "Verified Partner",
  },
};

const sizeStyles = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-3 py-1",
  lg: "text-base px-4 py-1.5",
};

export function TierBadge({
  tier,
  className,
  size = "md",
  showIcon = true,
}: TierBadgeProps) {
  const style = tierStyles[tier];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        style.bg,
        style.text,
        sizeStyles[size],
        tier === "VERIFIED_PARTNER" &&
          "shadow-lg shadow-green-500/30 ring-1 ring-green-400/50",
        className
      )}
    >
      {showIcon && style.icon && <span>{style.icon}</span>}
      <span>{style.label}</span>
    </span>
  );
}

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-lg shadow-green-500/30 ring-1 ring-green-400/50",
        className
      )}
    >
      <svg
        className="h-4 w-4"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      <span>Verified Partner</span>
    </div>
  );
}
