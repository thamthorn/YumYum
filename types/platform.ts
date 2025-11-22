// Type definitions for 3-Tier Subscription System & Platform Enhancements
// These types extend the existing Database types

export type SubscriptionTier = "FREE" | "INSIGHTS" | "VERIFIED_PARTNER";

export type SubscriptionStatus =
  | "ACTIVE"
  | "CANCELLED"
  | "PENDING"
  | "PAST_DUE";

export type OEMProfileStatus =
  | "UNREGISTERED"
  | "REGISTERED"
  | "DRAFT"
  | "INCOMPLETE"
  | "ACTIVE"
  | "VERIFIED_PENDING"
  | "VERIFIED";

export type InspectionStatus =
  | "PENDING"
  | "SCHEDULED"
  | "COMPLETED"
  | "CANCELLED";

export type AnalyticsEventType =
  | "PROFILE_VIEW"
  | "CONTACT_CLICK"
  | "RFQ_SENT"
  | "PRODUCT_VIEW"
  | "SAVE_OEM"
  | "UNSAVE_OEM";

export type CertificationType =
  | "GMP"
  | "ISO_9001"
  | "ISO_22716"
  | "ISO22000"
  | "HACCP"
  | "HALAL"
  | "ORGANIC"
  | "FDA_THAILAND"
  | "FDA"
  | "FSSC22000"
  | "BRC"
  | "OTHER";

export interface OEMCapabilities {
  oem_org_id: string;
  has_rd: boolean;
  has_packaging: boolean;
  has_formula_library: boolean;
  has_white_label: boolean;
  has_export_experience: boolean;
  languages: string[];
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
  alt_text: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  oem_org_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface InspectionBooking {
  id: string;
  oem_org_id: string;
  scheduled_date: string | null;
  status: InspectionStatus;
  inspector_id: string | null;
  report_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OEMAnalyticsEvent {
  id: string;
  oem_org_id: string;
  event_type: AnalyticsEventType;
  user_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface OEMKeywordTraffic {
  id: string;
  oem_org_id: string;
  keyword: string;
  count: number;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface OEMMedia {
  id: string;
  oem_org_id: string;
  media_type: string; // 'factory_tour', 'qc_process', 'product_demo'
  title: string;
  video_url: string | null;
  thumbnail_url: string | null;
  external_link: string | null;
  duration_seconds: number | null;
  file_size_mb: number | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface OEMProfileDraft {
  oem_org_id: string;
  draft_data: Record<string, any>;
  step: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedOEM {
  id: string;
  buyer_org_id: string;
  oem_org_id: string;
  notes: string | null;
  created_at: string;
}

// Enhanced OEM Profile with new fields
export interface EnhancedOEMProfile {
  organization_id: string;
  company_name_th: string | null;
  line_id: string | null;
  wechat_id: string | null;
  moq_skincare: number | null;
  moq_haircare: number | null;
  moq_supplements: number | null;
  moq_makeup: number | null;
  profile_status: OEMProfileStatus;
  verified_at: string | null;
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  // ... existing fields from oem_profiles
}

// Backwards-compatible alias used across the codebase
export type OEMProfile = EnhancedOEMProfile;

// Enhanced Product with new fields
export interface EnhancedProduct {
  id: string;
  oem_org_id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  lead_time_days: number | null;
  price_min: number | null;
  price_max: number | null;
  moq: number | null;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
}

// Enhanced Certification
export interface EnhancedCertification {
  oem_org_id: string;
  certification_id: string;
  certification_type: CertificationType | null;
  file_url: string | null;
  expiry_date: string | null;
  notes: string | null;
  verified: boolean;
  verified_at: string | null;
  verifier_id: string | null;
  created_at: string;
}

// Subscription tier features
export interface TierFeatures {
  name: string;
  price: number;
  billingPeriod: "month" | "year";
  features: {
    basicListing: boolean;
    productCatalog: boolean;
    profileViews: boolean;
    keywordInsights: boolean;
    trendReports: "none" | "basic" | "advanced";
    competitorInsights: "none" | "limited" | "full";
    exportData: "none" | "csv" | "pdf_csv";
    factoryInspection: boolean;
    verifiedBadge: boolean;
    factoryTourVideo: boolean;
    qcVideo: boolean;
    rankBoost: boolean;
  };
}

export const TIER_FEATURES: Record<SubscriptionTier, TierFeatures> = {
  FREE: {
    name: "Free",
    price: 0,
    billingPeriod: "month",
    features: {
      basicListing: true,
      productCatalog: true,
      profileViews: false,
      keywordInsights: false,
      trendReports: "none",
      competitorInsights: "none",
      exportData: "none",
      factoryInspection: false,
      verifiedBadge: false,
      factoryTourVideo: false,
      qcVideo: false,
      rankBoost: false,
    },
  },
  INSIGHTS: {
    name: "Insights",
    price: 2999,
    billingPeriod: "month",
    features: {
      basicListing: true,
      productCatalog: true,
      profileViews: true,
      keywordInsights: true,
      trendReports: "basic",
      competitorInsights: "limited",
      exportData: "csv",
      factoryInspection: false,
      verifiedBadge: false,
      factoryTourVideo: false,
      qcVideo: false,
      rankBoost: false,
    },
  },
  VERIFIED_PARTNER: {
    name: "Verified Partner",
    price: 9999,
    billingPeriod: "month",
    features: {
      basicListing: true,
      productCatalog: true,
      profileViews: true,
      keywordInsights: true,
      trendReports: "advanced",
      competitorInsights: "full",
      exportData: "pdf_csv",
      factoryInspection: true,
      verifiedBadge: true,
      factoryTourVideo: true,
      qcVideo: true,
      rankBoost: true,
    },
  },
};

// Matching criteria weights for scoring algorithm
export interface MatchingCriteria {
  category: number; // 40%
  moq: number; // 25%
  leadTime: number; // 15%
  certifications: number; // 10%
  priceRange: number; // 5%
  verifiedTier: number; // 5%
}

export const MATCHING_WEIGHTS: MatchingCriteria = {
  category: 0.4,
  moq: 0.25,
  leadTime: 0.15,
  certifications: 0.1,
  priceRange: 0.05,
  verifiedTier: 0.05,
};

// Match score result
export interface MatchScore {
  oem_org_id: string;
  total_score: number;
  category_score: number;
  moq_score: number;
  lead_time_score: number;
  certification_score: number;
  price_score: number;
  tier_bonus: number;
}

// Insights dashboard data types
export interface ProfileViewsData {
  date: string;
  views: number;
}

export interface KeywordInsight {
  keyword: string;
  count: number;
  trend: "up" | "down" | "stable";
  change_percent: number;
}

export interface CompetitorInsight {
  oem_org_id: string;
  company_name: string;
  profile_views: number;
  rank: number;
  tier: SubscriptionTier;
}

export interface ConversionFunnelData {
  stage: "view" | "contact" | "rfq" | "conversion";
  count: number;
  percentage: number;
}

export interface InsightsDashboardData {
  summary: {
    total_profile_views: number;
    views_change_percent: number;
    top_keywords: KeywordInsight[];
    match_score_average: number;
  };
  charts: {
    profile_views_over_time: ProfileViewsData[];
    keyword_traffic: KeywordInsight[];
    category_interest: { category: string; count: number }[];
    conversion_funnel?: ConversionFunnelData[];
  };
  competitors?: CompetitorInsight[];
}

// Form data types for wizard steps
export interface ProductFormData {
  name: string;
  category_id: string;
  description: string;
  moq: number;
  lead_time_days: number;
  price_min?: number;
  price_max?: number;
  images: File[];
}

export interface CapabilitiesFormData {
  has_rd: boolean;
  has_packaging: boolean;
  has_formula_library: boolean;
  has_white_label: boolean;
  has_export_experience: boolean;
  languages: string[];
}

export interface CategoriesFormData {
  category_ids: string[];
}

export interface MOQFormData {
  moq_skincare?: number;
  moq_haircare?: number;
  moq_supplements?: number;
  moq_makeup?: number;
}

export interface CertificationsFormData {
  certifications: {
    certification_type: CertificationType;
    file: File | null;
    expiry_date?: string;
    notes?: string;
  }[];
}

// Matching form data
export interface MatchingFormData {
  category_id: string;
  target_price_min?: number;
  target_price_max?: number;
  volume: number;
  required_certifications: string[];
  preferred_lead_time_days?: number;
  preferred_country?: string;
  additional_requirements?: string;
}

// OEM Card display data (for lists)
export interface OEMCardData {
  organization_id: string;
  company_name: string;
  company_name_th: string | null;
  logo_url: string | null;
  country_code: string | null;
  location: string | null;
  tier: SubscriptionTier;
  verified_at: string | null;
  categories: string[];
  moq_min: number | null;
  lead_time_days: number | null;
  // UI specific fields
  moq?: number;
  leadTime?: number;
  slug?: string;
  logo?: string | null;
  certifications: CertificationType[];
  match_score?: number;
  video_thumbnail_url?: string | null;
  product_images: string[];
}
