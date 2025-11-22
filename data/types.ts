/** ========= Types ========= */
export type Industry =
  | "Fashion"
  | "F&B"
  | "Cosmetics"
  | "Dental/Medical"
  | "Education"
  | "Other";

export type Scale = "Small" | "Medium" | "Large";
export type VerificationTier =
  | "Verified"
  | "Certified"
  | "Trusted Partner"
  | "None";

export interface NavLink {
  label: string;
  href: string;
}

export interface NavConfig {
  loggedOut: NavLink[];
  loggedIn: NavLink[];
}

export interface PreviousProduct {
  id: string;
  title: string;
  imageUrl: string;
  tags?: string[];
  note?: string;
}

export interface OEM {
  id: number;
  name: string;
  industry: Industry[];
  scale: Scale;
  moqMin: number;
  moqMax?: number;
  services: string[];
  location: string;
  crossBorder: boolean;
  certifications: Array<{ name: string; verified: boolean }>;
  verification: VerificationTier;
  badges?: string[];
  speedRating?: number;
  responsivenessRating?: number;
  shortDescription?: string;
  established?: number;
  employees?: string;
  languages?: string[];
  leadTime?: number;
  responseTime?: number;
  rating?: number;
  totalReviews?: number;
  prototypeSupport?: boolean;
  previousProducts?: PreviousProduct[];
}

export interface BuyerProfile {
  id: string;
  companyName: string;
  role: "enterprise" | "sme";
  preferredLocations: string[];
  minMOQ?: number;
  deadlineDays?: number;
  requiredCerts?: string[];
  prototypeNeeded?: boolean;
  budgetBand?: "Low" | "Medium" | "High";
}

export interface Message {
  id: string;
  from: "buyer" | "oem";
  text: string;
  at: string;
  attachments?: Array<{ name: string; url: string }>;
}

export interface MessageThread {
  id: string;
  oemId: number;
  oemName: string;
  oemScale: Scale;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  read: boolean;
  messages?: Message[];
}

export interface QuoteRequest {
  id: number;
  oem: string;
  product: string;
  quantity: number;
  status: "Pending Response" | "Quote Received" | "In Production";
  date: string;
  type: "quote" | "prototype";
}

export interface Match {
  id: number;
  oemId: number;
  oemName: string;
  industry: Industry;
  scale: Scale;
  matchScore: number;
  matchReason: string[];
  moqRange: string;
  location: string;
  responseTime: string;
  status:
    | "New Match"
    | "Contacted"
    | "In Discussion"
    | "Quote Requested"
    | "Declined";
  contactedDate?: string;
  lastActivity?: string;
  orderId?: string;
}

export type OrderStage =
  | "Signed"
  | "Preparation"
  | "Manufacturing"
  | "Delivering"
  // additional stages used elsewhere in the app (order flow / constants)
  | "Draft"
  | "Payment"
  | "Production"
  | "Shipping"
  | "Completed";

export interface OrderItem {
  sku?: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  oemId: number;
  oemName: string;
  buyerId: string;
  status: OrderStage;
  timeline: Partial<Record<OrderStage, string>>;
  items: OrderItem[];
  subtotal: number;
  shippingFee?: number;
  tax?: number;
  total: number;
  quantityTotal: number;
  shippingProvider?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
}

export interface Review {
  id: string;
  buyer: string;
  rating: number;
  date: string;
  comment: string;
  scores: {
    speed: number;
    responsiveness: number;
    quality: number;
    onTime: number;
  };
}
