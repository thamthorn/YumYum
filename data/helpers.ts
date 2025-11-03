import type {
  Industry,
  Scale,
  OrderStage,
  OEM,
  MessageThread,
  Review,
  Order,
} from "./types";
import { OEMS } from "./oems";
import { MESSAGE_THREADS } from "./messages";
import { REVIEWS } from "./reviews";
import { ORDERS } from "./orders";
import { ORDER_STEPS } from "./constants";

/** ========= Selectors / Helpers ========= */
export const getOEMById = (id: number): OEM | undefined => {
  return OEMS.find((o) => o.id === id);
};

export const getOEMsByIndustry = (industry: Industry): OEM[] => {
  return OEMS.filter((o) => o.industry.includes(industry));
};

export const getOEMsByScale = (scale: Scale): OEM[] => {
  return OEMS.filter((o) => o.scale === scale);
};

export const canViewOEMDetails = (isAuthenticated: boolean): boolean => {
  return isAuthenticated;
};

export const getMessageThreadsByBuyer = (): MessageThread[] => {
  return MESSAGE_THREADS;
};

export const getReviewsForOEM = (oemId: number): Review[] => {
  return REVIEWS[oemId] || [];
};

export const getScaleBadgeVariant = (scale: Scale): "scale" => {
  void scale;
  return "scale";
};

export const getVerifiedBadgeVariant = (
  verified: string
): "trusted" | "certified" | "verified" => {
  if (verified === "Trusted Partner") return "trusted";
  if (verified === "Partner") return "certified";
  return "verified";
};

export const getStatusBadge = (
  status: string
): "outline" | "verified" | "certified" => {
  const variants: Record<string, "outline" | "verified" | "certified"> = {
    "Pending Response": "outline",
    "Quote Received": "verified",
    "In Production": "certified",
  };
  return variants[status] || "outline";
};

export const getMatchStatusVariant = (
  status: string
): "default" | "secondary" | "outline" | "destructive" => {
  const variants: Record<
    string,
    "default" | "secondary" | "outline" | "destructive"
  > = {
    "New Match": "default",
    Contacted: "secondary",
    "In Discussion": "default",
    "Quote Requested": "secondary",
    Declined: "outline",
  };
  return variants[status] || "outline";
};

export const getMatchStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    "New Match": "text-primary",
    Contacted: "text-info",
    "In Discussion": "text-success",
    "Quote Requested": "text-warning",
    Declined: "text-muted-foreground",
  };
  return colors[status] || "text-muted-foreground";
};

export const orderProgressIndex = (status: OrderStage): number => {
  return ORDER_STEPS.indexOf(status);
};

export const orderPercent = (status: OrderStage): number => {
  const idx = orderProgressIndex(status);
  return Math.round(((idx + 1) / ORDER_STEPS.length) * 100);
};

export const getOrderById = (id: string): Order | undefined => {
  return ORDERS.find((o) => o.id === id);
};

export const getOrdersByBuyer = (buyerId: string): Order[] => {
  return ORDERS.filter((o) => o.buyerId === buyerId);
};

export const formatCurrency = (amount: number): string => {
  return `฿${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDateShort = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};
