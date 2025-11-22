/** ========= Types ========= */
export type Industry =
  | "Fashion"
  | "F&B"
  | "Cosmetics"
  | "Dental/Medical"
  | "Education"
  | "Packaging"
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

export const ROUTES = {
  home: "/",
  login: "/login",
  buyerDashboard: "/dashboard/buyer",
  oemDashboard: "/dashboard/oem",
  messages: "/messages",
  messageThread: (id: string) => `/messages/${id}`,
  oems: "/oems",
  oemProfile: (id: number | string) => `/oem/${id}`,
  onboarding: "/onboarding/buyer",
  requestQuote: (oemId: string | number) => `/request/quote?oem=${oemId}`,
  requestPrototype: (oemId: string | number) =>
    `/request/prototype?oem=${oemId}`,
  results: "/results",
  trust: "/trust",
  pricing: "/pricing",
  orders: "/orders",
  orderDetail: (id: string) => `/orders/${id}`,
  savedOems: "/dashboard/buyer?tab=saved",
} as const;

export const NAV: NavConfig = {
  loggedOut: [
    { label: "Home", href: ROUTES.home },
    { label: "List of OEMs", href: ROUTES.oems },
  ],
  loggedIn: [
    { label: "Dashboard", href: "/dashboard" }, // Will redirect based on user type
    { label: "Messages", href: ROUTES.messages },
    { label: "Saved OEMs", href: ROUTES.savedOems },
    { label: "List of OEMs", href: ROUTES.oems },
  ],
};

export const OEMS: OEM[] = [
  {
    id: 1,
    name: "Premium Fashion Co.",
    industry: ["Fashion"],
    scale: "Large",
    moqMin: 1000,
    moqMax: 50000,
    services: [
      "Design Consultation",
      "Sampling & Prototyping",
      "Mass Production",
      "Quality Control",
      "Custom Packaging",
      "Logistics Support",
    ],
    location: "Bangkok, Thailand",
    crossBorder: true,
    certifications: [
      { name: "ISO 9001:2015", verified: true },
      { name: "GMP", verified: true },
      { name: "OEKO-TEX", verified: false },
    ],
    verification: "Trusted Partner",
    badges: ["🏭 Factory-grade"],
    speedRating: 5,
    responsivenessRating: 5,
    shortDescription:
      "Premium garment manufacturing facility specializing in fashion and textile production.",
    established: 2008,
    employees: "200-500",
    languages: ["English", "Thai", "Chinese"],
    leadTime: 45,
    responseTime: 24,
    rating: 4.8,
    totalReviews: 127,
    prototypeSupport: true,
    previousProducts: [
      {
        id: "pp-001-a",
        title: "Premium Cotton T-Shirt Collection",
        imageUrl:
          "https://images.squarespace-cdn.com/content/v1/5ed6e10fb011a123217ba702/1dd163cd-d007-4455-9e95-518ab99920ad/z4549404022185_c83beccb459d13c02f7ed051f92676b5.jpg",
        tags: ["Mass Production", "Export Quality"],
        note: "10,000 units delivered to EU market",
      },
      {
        id: "pp-001-b",
        title: "Sustainable Denim Line",
        imageUrl:
          "https://www.zevadenim.com/wp-content/uploads/2023/08/%EF%81%ACDenim-Recycling-and-Upcycling.webp",
        tags: ["OEKO-TEX", "Eco-friendly"],
        note: "Organic cotton denim with water-saving process",
      },
      {
        id: "pp-001-c",
        title: "Activewear Collection",
        imageUrl:
          "https://www.ninelineapparel.com/cdn/shop/products/mens-moisture-wicking-t-shirt-5-things-941969_1800x1800.png",
        tags: ["Technical Fabric", "High MOQ"],
        note: "Moisture-wicking sports apparel line",
      },
    ],
  },
  {
    id: 2,
    name: "Artisan Textiles",
    industry: ["Fashion"],
    scale: "Medium",
    moqMin: 500,
    moqMax: 5000,
    services: ["Custom Design", "Prototyping", "Small Batches"],
    location: "Chiang Mai, Thailand",
    crossBorder: false,
    certifications: [{ name: "ISO 9001", verified: true }],
    verification: "Verified",
    badges: ["🏠 Home-based"],
    speedRating: 4,
    responsivenessRating: 4,
    shortDescription:
      "Artisan textile manufacturing with focus on quality and customization.",
    established: 2015,
    employees: "20-50",
    languages: ["English", "Thai"],
    leadTime: 30,
    responseTime: 12,
    rating: 4.6,
    totalReviews: 45,
    prototypeSupport: true,
    previousProducts: [
      {
        id: "pp-002-a",
        title: "Handwoven Silk Scarves",
        imageUrl:
          "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=1200&h=900&fit=crop",
        tags: ["Artisan", "Custom Design"],
        note: "Traditional Thai silk weaving technique",
      },
      {
        id: "pp-002-b",
        title: "Organic Cotton Tote Bags",
        imageUrl:
          "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1200&h=900&fit=crop",
        tags: ["Eco-friendly", "Low MOQ"],
        note: "500 units with custom screen printing",
      },
    ],
  },
  {
    id: 3,
    name: "Swift Fashion Studio",
    industry: ["Fashion"],
    scale: "Small",
    moqMin: 100,
    moqMax: 2000,
    services: ["Fast Sampling", "Custom Orders", "Flexible MOQ"],
    location: "Bangkok, Thailand",
    crossBorder: false,
    certifications: [],
    verification: "Verified",
    badges: ["🏠 Home-based"],
    speedRating: 5,
    responsivenessRating: 5,
    shortDescription:
      "Flexible MOQ for rapid SKU testing and small batch production.",
    established: 2018,
    employees: "5-10",
    languages: ["English", "Thai"],
    leadTime: 14,
    responseTime: 6,
    rating: 4.9,
    totalReviews: 32,
    prototypeSupport: true,
  },
  {
    id: 4,
    name: "Food Innovation Labs",
    industry: ["F&B"],
    scale: "Large",
    moqMin: 5000,
    moqMax: 100000,
    services: ["R&D", "Mass Production", "Packaging", "Quality Control"],
    location: "Samut Prakan, Thailand",
    crossBorder: true,
    certifications: [
      { name: "ISO 22000", verified: true },
      { name: "GMP", verified: true },
      { name: "FDA", verified: true },
      { name: "HACCP", verified: true },
    ],
    verification: "Certified",
    badges: ["🏭 Factory-grade"],
    speedRating: 4,
    responsivenessRating: 4,
    shortDescription:
      "High-capacity food production with comprehensive R&D capabilities.",
    established: 2005,
    employees: "500+",
    languages: ["English", "Thai", "Japanese"],
    leadTime: 60,
    responseTime: 24,
    rating: 4.7,
    totalReviews: 89,
    prototypeSupport: true,
  },
  {
    id: 5,
    name: "Organic Snacks Co.",
    industry: ["F&B"],
    scale: "Medium",
    moqMin: 1000,
    moqMax: 20000,
    services: ["Organic Production", "Custom Recipes", "Private Label"],
    location: "Nakhon Pathom, Thailand",
    crossBorder: true,
    certifications: [
      { name: "Organic Certification", verified: true },
      { name: "GMP", verified: true },
    ],
    verification: "Verified",
    badges: ["🌱 Organic"],
    speedRating: 4,
    responsivenessRating: 5,
    shortDescription:
      "Organic snack manufacturing with custom recipe development.",
    established: 2012,
    employees: "50-100",
    languages: ["English", "Thai"],
    leadTime: 45,
    responseTime: 18,
    rating: 4.5,
    totalReviews: 56,
    prototypeSupport: true,
  },
  {
    id: 6,
    name: "Bangkok Beauty Labs",
    industry: ["Cosmetics"],
    scale: "Large",
    moqMin: 2000,
    moqMax: 50000,
    services: ["Formulation", "Testing", "Mass Production", "Packaging"],
    location: "Bangkok, Thailand",
    crossBorder: true,
    certifications: [
      { name: "ISO 22716", verified: true },
      { name: "GMP", verified: true },
      { name: "FDA", verified: true },
    ],
    verification: "Trusted Partner",
    badges: ["🏭 Factory-grade"],
    speedRating: 4,
    responsivenessRating: 4,
    shortDescription:
      "Premium cosmetics manufacturing with in-house formulation lab.",
    established: 2010,
    employees: "100-200",
    languages: ["English", "Thai", "Chinese"],
    leadTime: 50,
    responseTime: 24,
    rating: 4.7,
    totalReviews: 103,
    prototypeSupport: true,
  },
  {
    id: 7,
    name: "Natural Skincare Studio",
    industry: ["Cosmetics"],
    scale: "Small",
    moqMin: 300,
    moqMax: 3000,
    services: ["Natural Formulas", "Small Batches", "Custom Branding"],
    location: "Phuket, Thailand",
    crossBorder: false,
    certifications: [{ name: "Natural Certification", verified: true }],
    verification: "Verified",
    badges: ["🌿 Natural", "🏠 Home-based"],
    speedRating: 5,
    responsivenessRating: 5,
    shortDescription: "Natural skincare with flexible MOQ for testing.",
    established: 2017,
    employees: "5-10",
    languages: ["English", "Thai"],
    leadTime: 21,
    responseTime: 12,
    rating: 4.8,
    totalReviews: 28,
    prototypeSupport: true,
  },
  {
    id: 8,
    name: "MedTech Manufacturing",
    industry: ["Dental/Medical"],
    scale: "Large",
    moqMin: 1000,
    moqMax: 30000,
    services: ["FDA Compliant", "ISO Certified", "Precision Equipment"],
    location: "Pathum Thani, Thailand",
    crossBorder: true,
    certifications: [
      { name: "ISO 13485", verified: true },
      { name: "FDA", verified: true },
      { name: "CE Mark", verified: true },
    ],
    verification: "Certified",
    badges: ["🏭 Factory-grade", "🏥 Medical Grade"],
    speedRating: 4,
    responsivenessRating: 4,
    shortDescription:
      "Medical device manufacturing with strict quality controls.",
    established: 2003,
    employees: "200-300",
    languages: ["English", "Thai"],
    leadTime: 60,
    responseTime: 36,
    rating: 4.9,
    totalReviews: 67,
    prototypeSupport: false,
  },
  {
    id: 9,
    name: "Learning Materials Co.",
    industry: ["Education"],
    scale: "Medium",
    moqMin: 500,
    moqMax: 10000,
    services: ["Educational Toys", "Books", "Custom Materials"],
    location: "Bangkok, Thailand",
    crossBorder: true,
    certifications: [{ name: "Safety Standards", verified: true }],
    verification: "Verified",
    badges: ["📚 Educational"],
    speedRating: 4,
    responsivenessRating: 4,
    shortDescription: "Educational materials and toys manufacturing.",
    established: 2011,
    employees: "30-50",
    languages: ["English", "Thai"],
    leadTime: 40,
    responseTime: 24,
    rating: 4.6,
    totalReviews: 41,
    prototypeSupport: true,
  },
  {
    id: 10,
    name: "Custom Manufacturing Hub",
    industry: ["Other"],
    scale: "Medium",
    moqMin: 500,
    moqMax: 20000,
    services: ["Multi-category", "Flexible Production", "R&D Support"],
    location: "Chonburi, Thailand",
    crossBorder: true,
    certifications: [{ name: "ISO 9001", verified: true }],
    verification: "Verified",
    badges: ["🏭 Factory-grade"],
    speedRating: 4,
    responsivenessRating: 4,
    shortDescription:
      "Multi-category manufacturing with flexible capabilities.",
    established: 2014,
    employees: "50-100",
    languages: ["English", "Thai"],
    leadTime: 35,
    responseTime: 18,
    rating: 4.5,
    totalReviews: 52,
    prototypeSupport: true,
  },
];

/** ========= Additional Interfaces ========= */
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
  matchScore: number; // 0-100
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
  orderId?: string; // Link to order if one exists
}
export type OrderStage =
  | "Signed"
  | "Preparation"
  | "Manufacturing"
  | "Delivering";

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

/** ========= Constants ========= */
export const INDUSTRIES: Industry[] = [
  "Fashion",
  "F&B",
  "Cosmetics",
  "Dental/Medical",
  "Education",
  "Other",
];

/** ========= Additional Mock Data ========= */
export const MESSAGE_THREADS: MessageThread[] = [
  {
    id: "1",
    oemId: 1,
    oemName: "Premium Fashion Co.",
    oemScale: "Large",
    lastMessage:
      "We can definitely meet your MOQ requirements. Let me send you a detailed quote.",
    timestamp: "2 hours ago",
    unread: true,
    read: false,
  },
  {
    id: "2",
    oemId: 6,
    oemName: "Bangkok Beauty Labs",
    oemScale: "Large",
    lastMessage:
      "Thank you for your interest! When would be a good time to discuss your project?",
    timestamp: "1 day ago",
    unread: false,
    read: true,
  },
  {
    id: "3",
    oemId: 3,
    oemName: "Swift Fashion Studio",
    oemScale: "Small",
    lastMessage:
      "The samples are ready for shipping. Would you like photos first?",
    timestamp: "3 days ago",
    unread: false,
    read: true,
  },
  {
    id: "4",
    oemId: 4,
    oemName: "Food Innovation Labs",
    oemScale: "Large",
    lastMessage: "I've attached our certification documents for your review.",
    timestamp: "5 days ago",
    unread: false,
    read: true,
  },
];

export const QUOTE_REQUESTS: QuoteRequest[] = [
  {
    id: 1,
    oem: "Premium Fashion Co.",
    product: "Custom Denim Jacket",
    quantity: 5000,
    status: "Quote Received",
    date: "2024-01-10",
    type: "quote",
  },
  {
    id: 2,
    oem: "Food Innovation Labs",
    product: "Organic Snack Bar",
    quantity: 500,
    status: "Pending Response",
    date: "2024-01-12",
    type: "prototype",
  },
  {
    id: 3,
    oem: "Swift Samples Studio",
    product: "Prototype Bags",
    quantity: 10,
    status: "In Production",
    date: "1 week ago",
    type: "prototype",
  },
];

export const MATCHES: Match[] = [
  {
    id: 1,
    oemId: 1,
    oemName: "Premium Fashion Co.",
    industry: "Fashion",
    scale: "Large",
    matchScore: 95,
    matchReason: [
      "Matches your MOQ requirements (1,000+ units)",
      "Located in your preferred region (Bangkok)",
      "Has ISO certification you requested",
      "Fast response time (24h average)",
    ],
    moqRange: "1,000 - 50,000 units",
    location: "Bangkok, Thailand",
    responseTime: "24h",
    status: "Quote Requested",
    contactedDate: "3 days ago",
    lastActivity: "Received quote 1 day ago",
    orderId: "ord-1001",
  },
  {
    id: 2,
    oemId: 3,
    oemName: "Swift Fashion Studio",
    industry: "Fashion",
    scale: "Small",
    matchScore: 88,
    matchReason: [
      "Flexible MOQ perfect for prototypes",
      "Rapid turnaround (14 days average)",
      "Strong ratings for responsiveness (5/5)",
      "Located in Bangkok",
    ],
    moqRange: "100 - 2,000 units",
    location: "Bangkok, Thailand",
    responseTime: "6h",
    status: "In Discussion",
    contactedDate: "5 days ago",
    lastActivity: "Messaged 2 hours ago",
    orderId: "ord-1002",
  },
  {
    id: 3,
    oemId: 2,
    oemName: "Artisan Textiles",
    industry: "Fashion",
    scale: "Medium",
    matchScore: 82,
    matchReason: [
      "Custom design capabilities match your needs",
      "Medium scale fits your production volume",
      "Prototyping services available",
      "Verified manufacturer status",
    ],
    moqRange: "500 - 5,000 units",
    location: "Chiang Mai, Thailand",
    responseTime: "12h",
    status: "Contacted",
    contactedDate: "1 week ago",
    lastActivity: "Awaiting response",
  },
  {
    id: 4,
    oemId: 6,
    oemName: "Bangkok Beauty Labs",
    industry: "Cosmetics",
    scale: "Large",
    matchScore: 78,
    matchReason: [
      "Cross-border shipping available",
      "GMP and FDA certified",
      "Formulation services in-house",
      "Trusted Partner status",
    ],
    moqRange: "2,000 - 50,000 units",
    location: "Bangkok, Thailand",
    responseTime: "24h",
    status: "New Match",
    lastActivity: "Matched today",
    orderId: "ord-1003",
  },
  {
    id: 5,
    oemId: 7,
    oemName: "Natural Skincare Studio",
    industry: "Cosmetics",
    scale: "Small",
    matchScore: 75,
    matchReason: [
      "Natural formulations align with brand values",
      "Low MOQ for testing (300 units)",
      "Fast response time",
      "Custom branding support",
    ],
    moqRange: "300 - 3,000 units",
    location: "Phuket, Thailand",
    responseTime: "12h",
    status: "New Match",
    lastActivity: "Matched 2 days ago",
  },
  {
    id: 6,
    oemId: 4,
    oemName: "Food Innovation Labs",
    industry: "F&B",
    scale: "Large",
    matchScore: 70,
    matchReason: [
      "Full R&D capabilities",
      "Multiple food safety certifications",
      "Large production capacity",
      "Quality control processes",
    ],
    moqRange: "5,000 - 100,000 units",
    location: "Samut Prakan, Thailand",
    responseTime: "24h",
    status: "Declined",
    contactedDate: "2 weeks ago",
    lastActivity: "MOQ too high for current needs",
  },
];
export const REVIEWS: Record<number, Review[]> = {
  1: [
    {
      id: "r1",
      buyer: "StartupFashion Inc.",
      rating: 5,
      date: "2 weeks ago",
      comment: "Excellent quality and communication. Highly recommend!",
      scores: { speed: 5, responsiveness: 5, quality: 5, onTime: 5 },
    },
    {
      id: "r2",
      buyer: "TrendyWear Ltd.",
      rating: 4.5,
      date: "1 month ago",
      comment:
        "Great experience overall. Minor delay but they communicated proactively.",
      scores: { speed: 4, responsiveness: 5, quality: 5, onTime: 4 },
    },
  ],
};

export const ORDERS: Order[] = [
  {
    id: "ord-1001",
    oemId: 1,
    oemName: "Premium Fashion Co.",
    buyerId: "buyer-001",
    status: "Manufacturing",
    timeline: {
      Signed: "2025-10-10T09:10:00Z",
      Preparation: "2025-10-11T13:30:00Z",
      Manufacturing: "2025-10-13T08:00:00Z",
    },
    items: [
      {
        sku: "TSH-001",
        name: "Custom T-Shirt - Premium Cotton",
        quantity: 1000,
        unitPrice: 85,
      },
      {
        sku: "PKG-001",
        name: "Custom Packaging Box",
        quantity: 1000,
        unitPrice: 12,
      },
      { sku: "LBL-001", name: "Woven Label", quantity: 1000, unitPrice: 3.5 },
    ],
    subtotal: 100500,
    shippingFee: 3500,
    tax: 7245,
    total: 111245,
    quantityTotal: 3000,
    shippingProvider: "Kerry Express",
    trackingNumber: "TH-KRY-12345678",
    estimatedDelivery: "2025-10-22T00:00:00Z",
    notes:
      "Prototype approved on Oct 8. Full production run started Oct 13. QC inspection scheduled for Oct 18.",
  },
  {
    id: "ord-1002",
    oemId: 3,
    oemName: "Swift Fashion Studio",
    buyerId: "buyer-001",
    status: "Preparation",
    timeline: {
      Signed: "2025-10-12T14:20:00Z",
      Preparation: "2025-10-13T10:00:00Z",
    },
    items: [
      {
        sku: "PROTO-BAG-001",
        name: "Prototype Tote Bag - Canvas",
        quantity: 50,
        unitPrice: 120,
      },
      {
        sku: "PROTO-BAG-002",
        name: "Prototype Crossbody - Leather",
        quantity: 30,
        unitPrice: 280,
      },
    ],
    subtotal: 15600,
    shippingFee: 0,
    tax: 1092,
    total: 16692,
    quantityTotal: 80,
    shippingProvider: "Thailand Post",
    trackingNumber: "TH-POST-87654321",
    estimatedDelivery: "2025-10-25T00:00:00Z",
  },
];

export const DASHBOARD_STATS = [
  { label: "Active Requests", value: "3", color: "text-primary" },
  { label: "Messages", value: "12", color: "text-info" },
  { label: "Saved OEMs", value: "8", color: "text-destructive" },
  { label: "Matches", value: "24", color: "text-success" },
];

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
  // Use a unified neutral "scale" style for Small/Medium/Large to match Vite
  // (icon/text differentiates the type, color stays consistent)
  void scale; // suppress unused since style is unified
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
    Contacted: "default",
    contacted: "default",
    "In Discussion": "secondary",
    "Quote Requested": "secondary",
    Declined: "outline",
    declined: "outline",
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

/** ========= Order Helpers ========= */
export const ORDER_STEPS: OrderStage[] = [
  "Signed",
  "Preparation",
  "Manufacturing",
  "Delivering",
];

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

/** ========= Copy / Content ========= */
export const COPY = {
  toasts: {
    needLoginProfile: "Please log in to view OEM profiles.",
    needLoginMessages: "Please log in to access Messages.",
    loggedOut: "You've logged out.",
    loginSuccess: "Logged in successfully!",
  },
  login: {
    loggedInTitle: "You're logged in.",
    logoutBtn: "Log out",
  },
  ctas: {
    getMatch: "Get Match",
    viewProfile: "View Profile",
    requestQuote: "Request Quote",
    requestPrototype: "Request Prototype",
    directMessage: "Direct Message",
    logout: "Logout",
  },
  pages: {
    oemList: {
      title: "Find Your Perfect",
      titleHighlight: "OEM Partner",
      subtitle:
        "Browse verified manufacturers by industry. Select a category to discover OEM partners that match your needs.",
      selectIndustry: "Select Industry",
      noOEMs: "No OEMs found in this category yet. Check back soon!",
      emptyStateTitle: "Select an Industry to Get Started",
      emptyStateSubtitle:
        "Choose an industry above to browse verified OEM manufacturers",
    },
    messages: {
      title: "Messages",
      subtitle: "Direct conversations with OEM manufacturers",
      search: "Search conversations...",
      emptyTitle: "No messages yet",
      emptySubtitle: "Start a conversation with an OEM from their profile page",
      browseOEMs: "Browse OEMs",
    },
    dashboard: {
      welcome: "Welcome Back!",
      subtitle: "Manage your manufacturing requests and connections",
      newRequest: "New Request",
    },
  },
};
