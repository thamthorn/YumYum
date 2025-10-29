import type { Industry, NavConfig, OrderStage } from "./types";

export const ROUTES = {
  home: "/",
  login: "/login",
  buyerDashboard: "/dashboard/buyer",
  oemDashboard: "/dashboard/oem",
  messages: "/messages",
  messageThread: (id: string) => `/messages/${id}`,
  oems: "/oems",
  oemProfile: (id: number) => `/oem/${id}`,
  onboarding: "/onboarding/buyer",
  requestQuote: (oemId: number) => `/request/quote?oem=${oemId}`,
  requestPrototype: (oemId: number) => `/request/prototype?oem=${oemId}`,
  results: "/results",
  trust: "/trust",
  pricing: "/pricing",
  orders: "/orders",
  orderDetail: (id: string) => `/orders/${id}`,
} as const;

export const NAV: NavConfig = {
  loggedOut: [
    { label: "Home", href: ROUTES.home },
    { label: "List of OEMs", href: ROUTES.oems },
  ],
  loggedIn: [
    { label: "Dashboard", href: ROUTES.buyerDashboard },
    { label: "Messages", href: ROUTES.messages },
    { label: "List of OEMs", href: ROUTES.oems },
  ],
};

export const INDUSTRIES: Industry[] = [
  "Fashion",
  "F&B",
  "Cosmetics",
  "Dental/Medical",
  "Education",
  "Other",
];

export const DASHBOARD_STATS = [
  { label: "Active Requests", value: "3", color: "text-primary" },
  { label: "Messages", value: "12", color: "text-info" },
  { label: "Saved OEMs", value: "8", color: "text-destructive" },
  { label: "Matches", value: "24", color: "text-success" },
];

export const ORDER_STEPS: OrderStage[] = [
  "Signed",
  "Preparation",
  "Manufacturing",
  "Delivering",
];

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
