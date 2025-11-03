"use client";

import { use, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import ProtectedClient from "@/components/ProtectedClient";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PaymentModal, type PaymentBreakdown } from "@/components/PaymentModal";
import { EscrowStatusBadge } from "@/components/EscrowStatusBadge";
import {
  PaymentTimeline,
  type PaymentEvent,
} from "@/components/PaymentTimeline";
import {
  Package,
  Loader2,
  Calendar,
  Factory,
  CheckCircle2,
  Clock,
  MessageSquare,
  Download,
  FileText,
  Truck,
  AlertCircle,
  X,
  CreditCard,
  Shield,
} from "lucide-react";
import { ROUTES } from "@/data/MockData";

type OrderLineItem = {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: string;
  currency: string;
};

type OrderEvent = {
  id: string;
  event_type: string;
  stage: string;
  created_at: string;
};

type OrderData = {
  id: string;
  status: string;
  created_at: string;
  request_id?: string;
  oem_organization: {
    display_name: string;
  } | null;
  order_line_items: OrderLineItem[];
  order_events: OrderEvent[];
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  signed: "Signed",
  preparation: "Preparation",
  manufacturing: "Manufacturing",
  delivering: "Delivering",
  completed: "Completed",
  cancelled: "Cancelled",
};

const ORDER_STEPS = [
  "signed",
  "preparation",
  "manufacturing",
  "delivering",
  "completed",
] as const;

const formatCurrency = (amount: number, currency: string = "THB") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDateShort = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

function OrderClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<"deposit" | "balance">(
    "deposit"
  );

  // Fetch order from API
  const {
    data: orderData,
    isLoading,
    error,
  } = useQuery<OrderData>({
    queryKey: ["order", id],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch order");
      }
      const data = await response.json();
      return data.order;
    },
  });

  // Determine payment states based on order status
  const depositPaid =
    orderData?.status === "manufacturing" ||
    orderData?.status === "delivering" ||
    orderData?.status === "completed";

  const balancePaid =
    orderData?.status === "delivering" || orderData?.status === "completed";

  const deliveryConfirmed = orderData?.status === "completed";

  // Cancel order handler
  const handleCancelOrder = async () => {
    setIsCancelling(true);
    try {
      const response = await fetch(`/api/orders/${id}/cancel`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        // Success - show toast and redirect
        toast({
          title: "Order Cancelled",
          description: "Your order has been cancelled successfully.",
        });

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["order", id] });
        queryClient.invalidateQueries({ queryKey: ["orders"] });

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard/buyer");
        }, 1500);
      } else {
        // Error from API
        toast({
          title: "Error",
          description: data.error || "Failed to cancel order",
          variant: "destructive",
        });
        setShowCancelDialog(false);
      }
    } catch (error) {
      console.error("Failed to cancel order:", error);
      toast({
        title: "Error",
        description: "An error occurred while cancelling the order",
        variant: "destructive",
      });
      setShowCancelDialog(false);
    } finally {
      setIsCancelling(false);
    }
  };

  // Message OEM handler
  const handleMessageOEM = () => {
    if (orderData?.request_id) {
      router.push(`/messages?requestId=${orderData.request_id}`);
    } else {
      alert("Message OEM - Coming soon!");
    }
  };

  // Payment handlers
  const handleOpenPayment = (type: "deposit" | "balance") => {
    setPaymentType(type);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = () => {
    // Refresh order data after payment
    queryClient.invalidateQueries({ queryKey: ["order", id] });
    queryClient.invalidateQueries({ queryKey: ["buyer-orders"] });
  };

  const handleConfirmDelivery = async () => {
    try {
      // Call API to update order status to completed and release escrow
      const response = await fetch(`/api/orders/${id}/complete`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to confirm delivery");
      }

      const result = await response.json();

      // Show success toast
      toast({
        title: "เงินถูกโอนให้ OEM แล้ว",
        description:
          result.message ||
          `ยอดเงิน ${formatCurrency(calculatePayment(total).totalToOEM, currency)} ถูกโอนให้ OEM (หักค่าบริการ 5%)`,
      });

      // Refresh order data
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["buyer-orders"] });
    } catch (err) {
      console.error("Delivery confirmation error:", err);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถยืนยันการรับสินค้าได้",
        variant: "destructive",
      });
    }
  };

  // Download invoice handler
  const handleDownloadInvoice = () => {
    alert("Download invoice - Coming soon!");
  };

  // View contract handler
  const handleViewContract = () => {
    if (orderData?.request_id) {
      router.push(`/results?id=${orderData.request_id}`);
    } else {
      alert("View contract - Coming soon!");
    }
  };

  if (isLoading) {
    return (
      <ProtectedClient>
        <div className="min-h-screen bg-background">
          <Navigation />
          <section className="pt-24 pb-12">
            <div className="container mx-auto max-w-4xl">
              <Card className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading order...</p>
              </Card>
            </div>
          </section>
        </div>
      </ProtectedClient>
    );
  }

  if (error || !orderData) {
    return (
      <ProtectedClient>
        <div className="min-h-screen bg-background">
          <Navigation />
          <section className="pt-24 pb-12">
            <div className="container mx-auto max-w-4xl">
              <Card className="p-12 text-center">
                <h1 className="text-2xl font-semibold mb-2">Order Not Found</h1>
                <p className="text-muted-foreground mb-4">
                  We couldn&apos;t find an order with ID {id}.
                </p>
                <Button asChild>
                  <Link href={ROUTES.orders}>Back to Orders</Link>
                </Button>
              </Card>
            </div>
          </section>
        </div>
      </ProtectedClient>
    );
  }

  // Calculate total
  const total = orderData.order_line_items.reduce(
    (sum: number, item: OrderLineItem) =>
      sum + item.quantity * parseFloat(item.unit_price),
    0
  );

  const currency = orderData.order_line_items[0]?.currency || "THB";

  // Calculate payment breakdown
  const calculatePayment = (orderTotal: number): PaymentBreakdown => {
    const deposit = orderTotal * 0.3;
    const balance = orderTotal * 0.7;
    const serviceFee = orderTotal * 0.05;
    const totalToOEM = orderTotal - serviceFee;

    return {
      subtotal: orderTotal,
      deposit,
      balance,
      serviceFee,
      totalToOEM,
      totalFromBuyer: orderTotal,
      currency,
    };
  };

  // Mock payment timeline data
  const mockPaymentEvents: PaymentEvent[] = [];
  if (depositPaid) {
    mockPaymentEvents.push({
      id: "1",
      type: "deposit",
      amount: calculatePayment(total).deposit,
      currency,
      status: "completed",
      timestamp: new Date().toISOString(),
      description: "Initial deposit payment received",
    });
  }
  if (balancePaid) {
    mockPaymentEvents.push({
      id: "2",
      type: "balance",
      amount: calculatePayment(total).balance,
      currency,
      status: "completed",
      timestamp: new Date().toISOString(),
      description: "Balance payment received before shipment",
    });
  }
  if (deliveryConfirmed) {
    mockPaymentEvents.push({
      id: "3",
      type: "service_fee",
      amount: calculatePayment(total).serviceFee,
      currency,
      status: "completed",
      timestamp: new Date().toISOString(),
      description: "Platform service fee (5%)",
    });
    mockPaymentEvents.push({
      id: "4",
      type: "release",
      amount: calculatePayment(total).totalToOEM,
      currency,
      status: "completed",
      timestamp: new Date().toISOString(),
      description: "Payment released to OEM",
    });
  }

  // Determine escrow status
  const getEscrowStatus = () => {
    if (deliveryConfirmed) return "released";
    if (depositPaid || balancePaid) return "held";
    return "pending";
  };

  const escrowAmount =
    depositPaid && balancePaid
      ? total
      : depositPaid
        ? calculatePayment(total).deposit
        : 0;

  const currentStepIndex = ORDER_STEPS.indexOf(
    orderData.status as (typeof ORDER_STEPS)[number]
  );

  const getStepIcon = (index: number) => {
    if (index < currentStepIndex) {
      return <CheckCircle2 className="h-6 w-6 text-white" />;
    } else if (index === currentStepIndex) {
      return <Clock className="h-6 w-6 text-white animate-pulse" />;
    } else {
      return <div className="w-6 h-6 rounded-full border-2 border-muted" />;
    }
  };

  const getStepStatus = (
    index: number
  ): "completed" | "current" | "upcoming" => {
    if (index < currentStepIndex) return "completed";
    if (index === currentStepIndex) return "current";
    return "upcoming";
  };

  return (
    <ProtectedClient>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-6xl">
            {/* Breadcrumb */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Link
                  href={ROUTES.buyerDashboard}
                  className="hover:text-primary"
                >
                  Dashboard
                </Link>
                <span>/</span>
                <Link href={ROUTES.orders} className="hover:text-primary">
                  Orders
                </Link>
                <span>/</span>
                <span className="text-foreground">
                  {orderData.id.slice(0, 8)}...
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-4">Order Tracking</h1>
            </div>

            {/* Status-specific Alert Banner */}
            {orderData.status === "signed" && (
              <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Payment Pending
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Your order is awaiting payment confirmation. Once payment
                      is received, production will begin.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {(orderData.status === "processing" ||
              orderData.status === "preparation") && (
              <Card className="p-4 mb-6 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                      Preparing Your Order
                    </h4>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      The OEM is currently preparing materials and setting up
                      production for your order.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {(orderData.status === "in_production" ||
              orderData.status === "manufacturing") && (
              <Card className="p-4 mb-6 bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-3">
                  <Factory className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                      Manufacturing in Progress
                    </h4>
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      Your order is currently being manufactured. We&apos;ll
                      notify you when it&apos;s ready for shipping.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {(orderData.status === "delivering" ||
              orderData.status === "in_transit") && (
              <Card className="p-4 mb-6 bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-1">
                      On the Way!
                    </h4>
                    <p className="text-sm text-indigo-800 dark:text-indigo-200">
                      Your order has been shipped and is on its way to you.
                      Track your shipment for real-time updates.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {(orderData.status === "delivered" ||
              orderData.status === "completed") && (
              <Card className="p-4 mb-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                      Order Completed
                    </h4>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Your order has been successfully delivered! Thank you for
                      your business.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {orderData.status === "cancelled" && (
              <Card className="p-4 mb-6 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <X className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                      Order Cancelled
                    </h4>
                    <p className="text-sm text-red-800 dark:text-red-200">
                      This order has been cancelled. If you have questions,
                      please contact the OEM.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Summary Card */}
            <Card className="p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">
                      Order #{orderData.id.slice(0, 8)}
                    </h2>
                    <Badge variant="default" className="bg-primary text-white">
                      {ORDER_STATUS_LABELS[orderData.status] ||
                        orderData.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Factory className="h-4 w-4" />
                    <span className="font-medium">
                      {orderData.oem_organization?.display_name || "OEM"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Amount
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {formatCurrency(total, currency)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Order Stepper */}
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold mb-6">Order Status</h3>

              {/* Desktop Horizontal Stepper */}
              <div className="hidden md:block">
                <div className="relative">
                  {/* Connection Line */}
                  <div
                    className="absolute top-8 left-0 right-0 h-0.5 bg-muted"
                    style={{ left: "2rem", right: "2rem" }}
                  >
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{
                        width: `${(currentStepIndex / (ORDER_STEPS.length - 1)) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Steps */}
                  <div className="relative flex justify-between">
                    {ORDER_STEPS.map((step, index) => {
                      const status = getStepStatus(index);

                      return (
                        <div
                          key={step}
                          className="flex flex-col items-center"
                          style={{ width: "20%" }}
                        >
                          {/* Icon */}
                          <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 z-10 transition-all ${
                              status === "completed"
                                ? "bg-primary"
                                : status === "current"
                                  ? "bg-primary"
                                  : "bg-muted"
                            }`}
                          >
                            {getStepIcon(index)}
                          </div>

                          {/* Label */}
                          <p
                            className={`font-semibold mb-1 text-center ${
                              status === "upcoming"
                                ? "text-muted-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {ORDER_STATUS_LABELS[step]}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Mobile Vertical Stepper */}
              <div className="md:hidden space-y-4">
                {ORDER_STEPS.map((step, index) => {
                  const status = getStepStatus(index);

                  return (
                    <div key={step} className="flex gap-4">
                      {/* Icon & Line */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                            status === "completed"
                              ? "bg-primary"
                              : status === "current"
                                ? "bg-primary"
                                : "bg-muted"
                          }`}
                        >
                          {getStepIcon(index)}
                        </div>
                        {index < ORDER_STEPS.length - 1 && (
                          <div
                            className={`w-0.5 flex-1 my-2 ${
                              index < currentStepIndex
                                ? "bg-primary"
                                : "bg-muted"
                            }`}
                            style={{ minHeight: "40px" }}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-4">
                        <p
                          className={`font-semibold mb-1 ${
                            status === "upcoming"
                              ? "text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {ORDER_STATUS_LABELS[step]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Payment & Escrow Section */}
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Information
                </h3>
                <EscrowStatusBadge
                  status={getEscrowStatus()}
                  amount={escrowAmount}
                  currency={currency}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Left: Payment Actions */}
                <div className="space-y-4">
                  {/* Payment Breakdown */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Order Total:
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(total, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Deposit (30%):
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(
                          calculatePayment(total).deposit,
                          currency
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Balance (70%):
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(
                          calculatePayment(total).balance,
                          currency
                        )}
                      </span>
                    </div>
                    <div className="pt-2 border-t flex justify-between text-xs text-muted-foreground">
                      <span>Service Fee (5%):</span>
                      <span>
                        {formatCurrency(
                          calculatePayment(total).serviceFee,
                          currency
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>OEM Receives:</span>
                      <span>
                        {formatCurrency(
                          calculatePayment(total).totalToOEM,
                          currency
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Payment Actions */}
                  <div className="space-y-3">
                    {!depositPaid && (
                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start gap-2 mb-3">
                          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              Pay Deposit to Start Production
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              30% deposit required. Funds held in escrow.
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleOpenPayment("deposit")}
                          className="w-full"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay Deposit{" "}
                          {formatCurrency(
                            calculatePayment(total).deposit,
                            currency
                          )}
                        </Button>
                      </div>
                    )}

                    {depositPaid && !balancePaid && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Deposit Paid</span>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                          <div className="flex items-start gap-2 mb-3">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                Balance Payment Required
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Pay before shipment. Funds held in escrow.
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleOpenPayment("balance")}
                            className="w-full"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pay Balance{" "}
                            {formatCurrency(
                              calculatePayment(total).balance,
                              currency
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {depositPaid && balancePaid && !deliveryConfirmed && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Full Payment Received</span>
                        </div>
                        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                          <div className="flex items-start gap-2 mb-3">
                            <Package className="h-5 w-5 text-green-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                Confirm Delivery
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Once you receive and inspect the products,
                                confirm to release payment to OEM.
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={handleConfirmDelivery}
                            variant="default"
                            className="w-full"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Confirm Delivery & Release Payment
                          </Button>
                        </div>
                      </div>
                    )}

                    {deliveryConfirmed && (
                      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                          <CheckCircle2 className="h-5 w-5" />
                          <div>
                            <p className="font-medium">Payment Released</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatCurrency(
                                calculatePayment(total).totalToOEM,
                                currency
                              )}{" "}
                              transferred to OEM
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Payment Timeline */}
                <div>
                  <h4 className="font-medium mb-4 text-sm text-muted-foreground">
                    Payment History
                  </h4>
                  <PaymentTimeline events={mockPaymentEvents} />
                </div>
              </div>
            </Card>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {/* Order Items */}
              <Card className="p-6 md:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Order Items</h3>

                <div className="space-y-3">
                  {orderData.order_line_items.map(
                    (item: OrderLineItem, index: number) => {
                      const lineTotal =
                        item.quantity * parseFloat(item.unit_price);

                      return (
                        <div
                          key={item.id || index}
                          className="flex justify-between items-start pb-3 border-b border-border last:border-0"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{item.description}</p>
                            {item.unit && (
                              <p className="text-sm text-muted-foreground">
                                Unit: {item.unit}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.quantity.toLocaleString()} ×{" "}
                              {formatCurrency(
                                parseFloat(item.unit_price),
                                item.currency
                              )}
                            </p>
                          </div>
                          <p className="font-semibold">
                            {formatCurrency(lineTotal, item.currency)}
                          </p>
                        </div>
                      );
                    }
                  )}
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">
                      {formatCurrency(total, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Total Items</span>
                    <span>{orderData.order_line_items.length} items</span>
                  </div>
                </div>
              </Card>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Order Info */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Order Details
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <Factory className="h-4 w-4 inline mr-1" />
                        OEM
                      </p>
                      <p className="font-medium">
                        {orderData.oem_organization?.display_name || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Order Date
                      </p>
                      <p className="font-medium">
                        {formatDate(orderData.created_at)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <Truck className="h-4 w-4" />
                        Estimated Delivery
                      </p>
                      <p className="font-medium">
                        {orderData.status === "completed" ||
                        orderData.status === "delivered"
                          ? "Delivered"
                          : orderData.status === "cancelled"
                            ? "Cancelled"
                            : "2-3 weeks"}
                      </p>
                    </div>

                    {orderData.request_id && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Request ID
                        </p>
                        <p className="font-mono text-xs">
                          {orderData.request_id.slice(0, 12)}...
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Actions */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Actions</h3>

                  <div className="space-y-2">
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={handleMessageOEM}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message OEM
                    </Button>

                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={handleDownloadInvoice}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Invoice
                    </Button>

                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={handleViewContract}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Contract
                    </Button>

                    {/* Cancel button - only show for certain statuses */}
                    {![
                      "cancelled",
                      "completed",
                      "delivered",
                      "in_transit",
                      "delivering",
                    ].includes(orderData.status) && (
                      <Button
                        className="w-full justify-start text-destructive hover:text-destructive"
                        variant="outline"
                        onClick={() => setShowCancelDialog(true)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </Card>

                {/* Order Events Timeline */}
                {orderData.order_events &&
                  orderData.order_events.length > 0 && (
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Order Timeline
                      </h3>
                      <div className="space-y-3">
                        {orderData.order_events
                          .sort(
                            (a: OrderEvent, b: OrderEvent) =>
                              new Date(b.created_at).getTime() -
                              new Date(a.created_at).getTime()
                          )
                          .map((event: OrderEvent, index: number) => (
                            <div
                              key={event.id || index}
                              className="flex items-start gap-3 text-sm"
                            >
                              <div className="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium">
                                    {event.event_type}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDateShort(event.created_at)}
                                  </span>
                                </div>
                                {event.stage && (
                                  <div className="text-muted-foreground">
                                    {event.stage}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </Card>
                  )}
              </div>
            </div>

            {/* Cancel Order Confirmation Dialog */}
            {showCancelDialog && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="max-w-md w-full p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 rounded-full bg-destructive/10">
                      <AlertCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">
                        Cancel Order?
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Are you sure you want to cancel this order? This action
                        cannot be undone. You may need to contact the OEM if the
                        order is already in production.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setShowCancelDialog(false)}
                      disabled={isCancelling}
                    >
                      Keep Order
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleCancelOrder}
                      disabled={isCancelling}
                    >
                      {isCancelling ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        "Cancel Order"
                      )}
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Payment Modal */}
        <PaymentModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          orderId={id}
          orderNumber={id}
          total={total}
          currency={currency}
          paymentType={paymentType}
          breakdown={calculatePayment(total)}
          escrowEnabled={true}
          onPaymentComplete={handlePaymentComplete}
        />
      </div>
    </ProtectedClient>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <OrderClient params={params} />;
}
