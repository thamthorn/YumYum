"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import ProtectedClient from "@/components/ProtectedClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EscrowStatusBadge } from "@/components/EscrowStatusBadge";
import { PaymentModal } from "@/components/PaymentModal";
import {
  Package,
  MessageSquare,
  Heart,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Target,
  Building2,
  FileText,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
  FileIcon,
  Truck,
  Eye,
  Shield,
  CreditCard,
} from "lucide-react";
import { ROUTES, COPY } from "@/data/MockData";
import { useSupabase } from "@/lib/supabase/session-context";
import { toast } from "sonner";

type RequestResponse = {
  id: string;
  status: string;
  type: string;
  title: string | null;
  productBrief: string | null;
  quantityMin: number | null;
  quantityMax: number | null;
  unit: string | null;
  timeline: string | null;
  shippingTerms: string | null;
  paymentTerms: string | null;
  addEscrow: boolean | null;
  addAudit: boolean | null;
  submittedAt: string | null;
  createdAt: string | null;
  files?: Array<{
    id: string;
    path: string;
    mimeType: string;
    sizeBytes: number;
  }>;
  oem: {
    id: string;
    name: string;
    slug: string | null;
    industry: string | null;
    location: string | null;
    scale: "small" | "medium" | "large" | null;
    rating: number | null;
    totalReviews: number | null;
  } | null;
};

// Unused - kept for future implementation
// type MatchResponse = {
//   id: string;
//   status: string;
//   score: number | null;
//   digest: Record<string, unknown> | null; // JSON from database
//   createdAt: string | null;
//   updatedAt: string | null;
//   oem: {
//     organizationId: string;
//     name: string;
//     slug: string | null;
//     industry: string | null;
//     location: string | null;
//     scale: "small" | "medium" | "large" | null;
//     rating: number | null;
//     totalReviews: number | null;
//     certifications: Array<{ name: string; issuedBy: string }>;
//   } | null;
// };

type SavedOemResponse = {
  oem_org_id: string;
  created_at: string;
  organizations: {
    id: string;
    display_name: string;
    slug: string | null;
  };
};

type OrderResponse = {
  id: string;
  oem_org_id: string;
  request_id: string;
  status: string;
  total_value: number;
  currency: string;
  quantity_total: number;
  unit: string;
  created_at: string;
  oem_organization: {
    id: string;
    slug: string | null;
    display_name: string;
  };
  order_line_items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
  }>;
};

function DashboardContent() {
  const { session, supabase } = useSupabase();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(
    null
  );
  const [paymentType, setPaymentType] = useState<"deposit" | "balance">(
    "deposit"
  );

  // Get active tab from URL query parameter
  const activeTab = searchParams.get("tab") || "requests";

  const {
    data: requests = [],
    isLoading: isLoadingRequests,
    error: requestError,
  } = useQuery<RequestResponse[]>({
    queryKey: ["buyer-requests"],
    queryFn: async () => {
      const response = await fetch("/api/requests");
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Unable to load requests");
      }
      const body = (await response.json()) as { data: RequestResponse[] };
      return body.data ?? [];
    },
    enabled: Boolean(session),
  });

  // Unused - kept for future implementation
  // const { data: matches = [], error: matchesError } = useQuery<MatchResponse[]>(
  //   {
  //     queryKey: ["buyer-matches"],
  //     queryFn: async () => {
  //       const response = await fetch("/api/matches");
  //       if (!response.ok) {
  //         const body = await response.json().catch(() => null);
  //         throw new Error(body?.error?.message ?? "Unable to load matches");
  //       }
  //       const body = (await response.json()) as { data: MatchResponse[] };
  //       return body.data ?? [];
  //     },
  //     enabled: Boolean(session),
  //     refetchInterval: 2000, // Auto-refetch every 2 seconds (faster updates)
  //     refetchOnWindowFocus: true, // Refetch when window regains focus
  //   }
  // );

  // Fetch saved OEMs
  const { data: savedOems = [], isLoading: isLoadingSavedOems } = useQuery<
    SavedOemResponse[]
  >({
    queryKey: ["saved-oems"],
    queryFn: async () => {
      const response = await fetch("/api/saved-oems");
      if (!response.ok) {
        throw new Error("Failed to load saved OEMs");
      }
      const body = (await response.json()) as { savedOems: SavedOemResponse[] };
      return body.savedOems ?? [];
    },
    enabled: Boolean(session),
  });

  // Fetch orders to check which matches have orders
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery<
    Array<{
      id: string;
      oem_org_id: string;
      request_id: string;
      status: string;
      total_value: number;
      currency: string;
      quantity_total: number;
      unit: string;
      created_at: string;
      oem_organization: {
        id: string;
        slug: string | null;
        display_name: string;
      };
      order_line_items: Array<{
        id: string;
        description: string;
        quantity: number;
        unit_price: number;
      }>;
    }>
  >({
    queryKey: ["buyer-orders"],
    queryFn: async () => {
      const response = await fetch("/api/orders");
      if (!response.ok) {
        return [];
      }
      const body = (await response.json()) as {
        orders: Array<{
          id: string;
          oem_org_id: string;
          request_id: string;
          status: string;
          total_value: number;
          currency: string;
          quantity_total: number;
          unit: string;
          created_at: string;
          oem_organization: {
            id: string;
            slug: string | null;
            display_name: string;
          };
          order_line_items: Array<{
            id: string;
            description: string;
            quantity: number;
            unit_price: number;
          }>;
        }>;
      };
      return body.orders ?? [];
    },
    enabled: Boolean(session),
  });

  // Unused - kept for future implementation
  // Track which OEMs are saved for quick lookup
  // const savedOemIds = new Set(savedOems.map((s) => s.oem_org_id));

  // Save OEM mutation
  // const saveOemMutation = useMutation({
  //   mutationFn: async (oemOrgId: string) => {
  //     const response = await fetch("/api/saved-oems", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ oemOrgId }),
  //     });
  //     if (!response.ok) {
  //       const body = await response.json().catch(() => null);
  //       throw new Error(body?.error ?? "Failed to save OEM");
  //     }
  //     return response.json();
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["saved-oems"] });
  //     toast.success("OEM saved successfully");
  //   },
  //   onError: (error: Error) => {
  //     toast.error(error.message);
  //   },
  // });

  // Unsave OEM mutation
  // const unsaveOemMutation = useMutation({
  //   mutationFn: async (oemOrgId: string) => {
  //     const response = await fetch(`/api/saved-oems?oemOrgId=${oemOrgId}`, {
  //       method: "DELETE",
  //     });
  //     if (!response.ok) {
  //       const body = await response.json().catch(() => null);
  //       throw new Error(body?.error ?? "Failed to remove saved OEM");
  //     }
  //     return response.json();
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["saved-oems"] });
  //     toast.success("OEM removed from saved");
  //   },
  //   onError: (error: Error) => {
  //     toast.error(error.message);
  //   },
  // });

  // Unused - kept for future implementation
  // const toggleSaveOem = (oemOrgId: string) => {
  //   if (savedOemIds.has(oemOrgId)) {
  //     unsaveOemMutation.mutate(oemOrgId);
  //   } else {
  //     saveOemMutation.mutate(oemOrgId);
  //   }
  // };

  // Clear matches mutation
  // const clearMatchesMutation = useMutation({
  //   mutationFn: async () => {
  //     const response = await fetch("/api/matches", {
  //       method: "DELETE",
  //     });
  //     if (!response.ok) {
  //       const body = await response.json().catch(() => null);
  //       throw new Error(body?.error?.message ?? "Failed to clear matches");
  //     }
  //     return response.json();
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["buyer-matches"] });
  //     toast.success("All matches cleared successfully");
  //   },
  //   onError: (error: Error) => {
  //     toast.error(error.message);
  //   },
  // });

  // Unused - kept for future implementation
  // const handleClearMatches = () => {
  //   if (matches.length === 0) {
  //     toast.info("No matches to clear");
  //     return;
  //   }

  //   if (
  //     confirm(
  //       `Are you sure you want to clear all ${matches.length} matches? This action cannot be undone.`
  //     )
  //   ) {
  //     clearMatchesMutation.mutate();
  //   }
  // };

  if (requestError) {
    toast.error(requestError.message);
  }

  // Fetch actual escrow data from database
  const { data: escrowData } = useQuery({
    queryKey: ["buyer-escrow"],
    queryFn: async () => {
      if (!session?.user?.id) return { totalHeld: 0, count: 0 };

      // Get buyer's organization ID first
      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("profile_id", session.user.id)
        .single();

      const buyerOrgId = (orgMember as unknown as { organization_id?: string })
        ?.organization_id;
      if (!buyerOrgId) return { totalHeld: 0, count: 0 };

      const { data: escrowRecords } = await supabase
        .from("escrow")
        .select("amount, status")
        .eq("buyer_org_id", buyerOrgId)
        .eq("status", "held");

      const totalHeld = escrowRecords
        ? escrowRecords.reduce(
            (sum: number, record: { amount: number }) => sum + record.amount,
            0
          )
        : 0;

      return {
        totalHeld,
        count: escrowRecords?.length || 0,
      };
    },
    enabled: !!session?.user,
  });

  // Use actual escrow data from database
  const totalHeldInEscrow = escrowData?.totalHeld || 0;
  const escrowProtectedOrders = escrowData?.count || 0;

  // Handle opening payment modal
  const handleOpenPayment = (
    order: OrderResponse,
    type: "deposit" | "balance"
  ) => {
    setSelectedOrder(order);
    setPaymentType(type);
    setShowPaymentModal(true);
  };

  // Handle payment completion
  const handlePaymentComplete = () => {
    setShowPaymentModal(false);
    // Refresh orders
    queryClient.invalidateQueries({ queryKey: ["buyer-orders"] });
  };

  const formatCurrency = (amount: number, currency: string = "THB") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const stats = [
    {
      label: "Active Requests",
      value: requests.length.toString(),
      icon: Package,
      color: "text-primary",
    },
    {
      label: "Messages",
      value: "-",
      icon: MessageSquare,
      color: "text-info",
    },
    {
      label: "Held in Escrow",
      value: totalHeldInEscrow > 0 ? formatCurrency(totalHeldInEscrow) : "฿0",
      icon: Shield,
      color: "text-blue-600",
      subtitle:
        escrowProtectedOrders > 0
          ? `${escrowProtectedOrders} order${escrowProtectedOrders > 1 ? "s" : ""} protected`
          : "No active escrow",
    },
    {
      label: "Saved OEMs",
      value: savedOems.length.toString(),
      icon: Heart,
      color: "text-destructive",
    },
  ];

  return (
    <ProtectedClient>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="pt-24 pb-12">
          <div className="container mx-auto max-w-6xl">
            <div className="flex justify-between items-center mb-8 animate-fade-in">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {COPY.pages.dashboard.welcome}
                </h1>
                <p className="text-muted-foreground">
                  {COPY.pages.dashboard.subtitle}
                </p>
              </div>
              <Button size="lg" asChild>
                <Link href={ROUTES.onboarding}>
                  {COPY.pages.dashboard.newRequest}
                </Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, index) => (
                <Card
                  key={stat.label}
                  className="p-6 animate-scale-in"
                  style={{
                    animationDelay: `${index * 50}ms` as unknown as string,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    <div className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                  {stat.subtitle && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {stat.subtitle}
                    </div>
                  )}
                </Card>
              ))}
            </div>

            <Tabs value={activeTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="requests"
                  className="cursor-pointer"
                  asChild
                >
                  <Link href="/dashboard/buyer?tab=requests">
                    <FileText className="h-4 w-4 mr-2" />
                    Requests
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="to-pay" className="cursor-pointer" asChild>
                  <Link href="/dashboard/buyer?tab=to-pay">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    To Pay
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="ordered" className="cursor-pointer" asChild>
                  <Link href="/dashboard/buyer?tab=ordered">
                    <Package className="h-4 w-4 mr-2" />
                    Ordered
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="history" className="cursor-pointer" asChild>
                  <Link href="/dashboard/buyer?tab=history">
                    <Clock className="h-4 w-4 mr-2" />
                    History
                  </Link>
                </TabsTrigger>
              </TabsList>

              {/* Requests Tab - Pending quotes */}
              <TabsContent value="requests" className="space-y-4">
                {isLoadingRequests ? (
                  <Card className="p-6 text-center text-muted-foreground">
                    Loading requests...
                  </Card>
                ) : requests.length === 0 ? (
                  <Card className="p-12 text-center text-muted-foreground">
                    You have not submitted any requests yet.
                  </Card>
                ) : (
                  requests.map((request) => (
                    <Card
                      key={request.id}
                      className="p-6 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">
                              {request.productBrief ??
                                request.title ??
                                "Request"}
                            </h3>
                            <Badge
                              variant={
                                request.status === "quote_received"
                                  ? "verified"
                                  : request.status === "in_production"
                                    ? "certified"
                                    : "outline"
                              }
                            >
                              {request.status.replace(/_/g, " ")}
                            </Badge>
                            <Badge variant="scale">
                              {request.type === "prototype"
                                ? "Prototype"
                                : "Quote"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span>
                              OEM:{" "}
                              {request.oem ? (
                                <Link
                                  href={ROUTES.oemProfile(
                                    request.oem.slug ?? request.oem.id
                                  )}
                                  className="underline"
                                >
                                  {request.oem.name}
                                </Link>
                              ) : (
                                "Unknown"
                              )}
                            </span>
                            {request.quantityMin && (
                              <>
                                <span>•</span>
                                <span>
                                  Qty: {request.quantityMin.toLocaleString()}{" "}
                                  {request.unit ?? "units"}
                                </span>
                              </>
                            )}
                            {request.createdAt && (
                              <>
                                <span>•</span>
                                <span>
                                  {new Date(
                                    request.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setActiveRequestId(
                                  activeRequestId === request.id
                                    ? null
                                    : request.id
                                )
                              }
                            >
                              View Details
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={ROUTES.messageThread(request.id)}>
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Message
                              </Link>
                            </Button>
                          </div>
                        </div>
                        <div className="text-right">
                          {request.status === "pending_oem" ? (
                            <Clock className="h-5 w-5 text-muted-foreground" />
                          ) : request.status === "quote_received" ? (
                            <AlertCircle className="h-5 w-5 text-primary" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          )}
                        </div>
                        {activeRequestId === request.id && (
                          <div className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground space-y-3">
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">
                                Product Brief
                              </h4>
                              <p>{request.productBrief ?? "N/A"}</p>
                            </div>

                            {/* Uploaded Files */}
                            {request.files && request.files.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-foreground mb-2">
                                  Uploaded Files
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                  {request.files.map((file) => {
                                    const isImage =
                                      file.mimeType.startsWith("image/");
                                    const imageUrl = supabase.storage
                                      .from("request-files")
                                      .getPublicUrl(file.path).data.publicUrl;

                                    return (
                                      <div
                                        key={file.id}
                                        className="relative aspect-square rounded-lg border border-border overflow-hidden bg-muted"
                                      >
                                        {isImage ? (
                                          <Image
                                            src={imageUrl}
                                            alt="Uploaded file"
                                            fill
                                            className="object-cover"
                                            unoptimized
                                          />
                                        ) : (
                                          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                            <FileIcon className="h-8 w-8 mb-2" />
                                            <span className="text-xs text-center px-2">
                                              {file.path
                                                .split("/")
                                                .pop()
                                                ?.slice(0, 20)}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-3">
                              <div>
                                <span className="font-semibold text-foreground">
                                  Quantity
                                </span>
                                <p>
                                  {request.quantityMin?.toLocaleString() ?? "-"}{" "}
                                  {request.unit ?? "units"}
                                </p>
                              </div>
                              <div>
                                <span className="font-semibold text-foreground">
                                  Timeline
                                </span>
                                <p>{request.timeline ?? "Not specified"}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-foreground">
                                  Shipping Terms
                                </span>
                                <p>
                                  {request.shippingTerms ?? "Not specified"}
                                </p>
                              </div>
                              <div>
                                <span className="font-semibold text-foreground">
                                  Payment Terms
                                </span>
                                <p>{request.paymentTerms ?? "Not specified"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span>
                                <Badge variant="outline">
                                  Escrow {request.addEscrow ? "Yes" : "No"}
                                </Badge>
                              </span>
                              <span>
                                <Badge variant="outline">
                                  Audit {request.addAudit ? "Yes" : "No"}
                                </Badge>
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* To Pay Tab - Quote received, pending payment */}
              <TabsContent value="to-pay" className="space-y-4">
                <div className="mb-6">
                  <p className="text-muted-foreground mb-4">
                    Orders and quotes awaiting payment to start production.
                  </p>
                </div>

                {isLoadingOrders && isLoadingRequests ? (
                  <Card className="p-6 text-center text-muted-foreground">
                    Loading...
                  </Card>
                ) : orders.filter((o) => o.status === "signed").length === 0 &&
                  requests.filter((r) => r.status === "quote_received")
                    .length === 0 ? (
                  <Card className="p-12 text-center text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="font-medium mb-2">No pending payments</p>
                    <p className="text-sm">
                      Orders and quotes will appear here when ready for payment
                    </p>
                  </Card>
                ) : (
                  <>
                    {/* Show signed orders first */}
                    {orders
                      .filter((order) => order.status === "signed")
                      .map((order) => (
                        <Card
                          key={order.id}
                          className="p-6 hover:shadow-md transition-all border-primary/20"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">
                                  {order.order_line_items[0]?.description ??
                                    "Order"}
                                </h3>
                                <Badge variant="verified">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Signed - Awaiting Payment
                                </Badge>
                                <EscrowStatusBadge
                                  status="pending"
                                  amount={order.total_value}
                                  currency={order.currency}
                                />
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4" />
                                  <span>
                                    {order.oem_organization.display_name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4" />
                                  <span>
                                    {order.quantity_total} {order.unit}
                                  </span>
                                  <span>•</span>
                                  <span className="font-semibold text-primary">
                                    {order.total_value} {order.currency}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-4">
                                <Button
                                  size="sm"
                                  className="cursor-pointer"
                                  onClick={() =>
                                    handleOpenPayment(order, "deposit")
                                  }
                                >
                                  <CreditCard className="h-4 w-4 mr-1" />
                                  Pay Deposit
                                </Button>
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={ROUTES.orderDetail(order.id)}>
                                    <Eye className="h-4 w-4 mr-1" />
                                    View Order
                                  </Link>
                                </Button>
                                <Button size="sm" variant="outline" asChild>
                                  <Link
                                    href={ROUTES.messageThread(
                                      order.request_id
                                    )}
                                  >
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    Message OEM
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}

                    {/* Then show quote_received requests */}
                    {requests
                      .filter((r) => r.status === "quote_received")
                      .map((request) => (
                        <Card
                          key={request.id}
                          className="p-6 hover:shadow-md transition-all border-primary/20"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">
                                  {request.productBrief ??
                                    request.title ??
                                    "Request"}
                                </h3>
                                <Badge variant="verified">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Quote Received
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                {request.oem && (
                                  <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    <span>{request.oem.name}</span>
                                    {request.oem.location && (
                                      <>
                                        <span>•</span>
                                        <MapPin className="h-3 w-3" />
                                        <span>{request.oem.location}</span>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2 mt-4">
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={ROUTES.messageThread(request.id)}>
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    Message OEM
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </>
                )}
              </TabsContent>

              {/* Ordered Tab - In production or shipped */}
              <TabsContent value="ordered" className="space-y-4">
                <div className="mb-6">
                  <p className="text-muted-foreground mb-4">
                    Active orders currently in production or being shipped.
                  </p>
                </div>

                {isLoadingOrders ? (
                  <Card className="p-6 text-center text-muted-foreground">
                    Loading orders...
                  </Card>
                ) : orders.filter(
                    (order) =>
                      order.status === "preparation" ||
                      order.status === "manufacturing" ||
                      order.status === "delivering"
                  ).length === 0 ? (
                  <Card className="p-12 text-center text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="font-medium mb-2">No active orders</p>
                    <p className="text-sm">
                      Your current orders will appear here
                    </p>
                  </Card>
                ) : (
                  orders
                    .filter(
                      (order) =>
                        order.status === "preparation" ||
                        order.status === "manufacturing" ||
                        order.status === "delivering"
                    )
                    .map((order) => (
                      <Card
                        key={order.id}
                        className="p-6 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">
                                {order.order_line_items[0]?.description ??
                                  "Order"}
                              </h3>
                              <Badge
                                variant={
                                  order.status === "preparation" ||
                                  order.status === "manufacturing"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {order.status === "preparation" ||
                                order.status === "manufacturing" ? (
                                  <>
                                    <Package className="h-3 w-3 mr-1" />
                                    {order.status === "preparation"
                                      ? "Preparing"
                                      : "Manufacturing"}
                                  </>
                                ) : (
                                  <>
                                    <Truck className="h-3 w-3 mr-1" />
                                    Delivering
                                  </>
                                )}
                              </Badge>
                              <EscrowStatusBadge
                                status="held"
                                amount={order.total_value}
                                currency={order.currency}
                              />
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                <span>
                                  {order.oem_organization.display_name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                <span>
                                  {order.quantity_total} {order.unit}
                                </span>
                                <span>•</span>
                                <span>
                                  {order.total_value} {order.currency}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              {/* Show Pay Balance button for manufacturing status */}
                              {order.status === "manufacturing" && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleOpenPayment(order, "balance")
                                  }
                                >
                                  <CreditCard className="h-4 w-4 mr-1" />
                                  Pay Balance
                                </Button>
                              )}
                              <Button size="sm" variant="outline" asChild>
                                <Link href={ROUTES.orderDetail(order.id)}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Order
                                </Link>
                              </Button>
                              <Button size="sm" variant="outline" asChild>
                                <Link
                                  href={ROUTES.messageThread(order.request_id)}
                                >
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Message OEM
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                )}
              </TabsContent>

              {/* Saved OEMs Tab */}
              <TabsContent value="saved" className="space-y-4">
                <div className="mb-6">
                  <p className="text-muted-foreground mb-4">
                    OEMs you&apos;ve bookmarked for later reference.
                  </p>
                </div>

                {isLoadingSavedOems ? (
                  <Card className="p-6 text-center text-muted-foreground">
                    Loading saved OEMs...
                  </Card>
                ) : savedOems.length === 0 ? (
                  <Card className="p-12 text-center text-muted-foreground">
                    <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="font-medium mb-2">No saved OEMs yet</p>
                    <p className="text-sm mb-4">
                      Save OEMs from search results to keep track of potential
                      partners
                    </p>
                    <Button asChild>
                      <Link href={ROUTES.oems}>
                        <Target className="h-4 w-4 mr-2" />
                        Browse OEMs
                      </Link>
                    </Button>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {savedOems.map((saved) => (
                      <Card
                        key={saved.oem_org_id}
                        className="p-6 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => {
                          window.location.href = ROUTES.oemProfile(
                            saved.organizations.slug ?? saved.oem_org_id
                          );
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-1">
                              {saved.organizations.display_name}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Saved on{" "}
                              {new Date(saved.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <BookmarkCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = ROUTES.oemProfile(
                                saved.organizations.slug ?? saved.oem_org_id
                              );
                            }}
                          >
                            View Profile
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = ROUTES.requestQuote(
                                saved.oem_org_id
                              );
                            }}
                          >
                            Request Quote
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* History Tab - Completed or cancelled orders */}
              <TabsContent value="history" className="space-y-4">
                <div className="mb-6">
                  <p className="text-muted-foreground mb-4">
                    Your completed and cancelled orders.
                  </p>
                </div>

                {isLoadingOrders ? (
                  <Card className="p-6 text-center text-muted-foreground">
                    Loading history...
                  </Card>
                ) : orders.filter(
                    (order) =>
                      order.status === "delivered" ||
                      order.status === "cancelled" ||
                      order.status === "completed"
                  ).length === 0 ? (
                  <Card className="p-12 text-center text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="font-medium mb-2">No order history</p>
                    <p className="text-sm">
                      Completed and cancelled orders will appear here
                    </p>
                  </Card>
                ) : (
                  orders
                    .filter(
                      (order) =>
                        order.status === "delivered" ||
                        order.status === "cancelled" ||
                        order.status === "completed"
                    )
                    .map((order) => (
                      <Card
                        key={order.id}
                        className="p-6 hover:shadow-md transition-all opacity-80"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">
                                {order.order_line_items[0]?.description ??
                                  "Order"}
                              </h3>
                              <Badge
                                variant={
                                  order.status === "delivered" ||
                                  order.status === "completed"
                                    ? "verified"
                                    : "outline"
                                }
                              >
                                {order.status === "delivered" ||
                                order.status === "completed" ? (
                                  <>
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Completed
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Cancelled
                                  </>
                                )}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                <span>
                                  {order.oem_organization.display_name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                <span>
                                  {order.quantity_total} {order.unit}
                                </span>
                                <span>•</span>
                                <span>
                                  {order.total_value} {order.currency}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <Button size="sm" variant="outline" asChild>
                                <Link href={ROUTES.orderDetail(order.id)}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Link>
                              </Button>
                              {(order.status === "delivered" ||
                                order.status === "completed") && (
                                <Button size="sm" variant="outline">
                                  <RefreshCw className="h-4 w-4 mr-1" />
                                  Reorder
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedOrder && (
        <PaymentModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          orderId={selectedOrder.id}
          orderNumber={selectedOrder.id}
          total={selectedOrder.total_value}
          currency={selectedOrder.currency}
          paymentType={paymentType}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </ProtectedClient>
  );
}

export default function BuyerDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <DashboardContent />
    </Suspense>
  );
}
