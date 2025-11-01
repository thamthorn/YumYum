"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import ProtectedClient from "@/components/ProtectedClient";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
                      <p className="text-sm text-muted-foreground mb-1">OEM</p>
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
                  </div>
                </Card>

                {/* Actions */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Actions</h3>

                  <div className="space-y-2">
                    <Button className="w-full justify-start" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message OEM
                    </Button>

                    <Button className="w-full justify-start" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Invoice
                    </Button>

                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      View Contract
                    </Button>
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
          </div>
        </div>
      </div>
    </ProtectedClient>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <OrderClient params={params} />;
}
