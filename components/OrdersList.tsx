"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Package, Truck, Loader2 } from "lucide-react";
import type { OrderWithDetails } from "@/domain/orders/service";

const ORDER_STEPS = [
  "Signed",
  "Preparation",
  "Manufacturing",
  "Delivering",
  "Completed",
];

const getOrderPercent = (status: string): number => {
  const statusMap: Record<string, number> = {
    signed: 0,
    preparation: 25,
    manufacturing: 50,
    delivering: 75,
    completed: 100,
    cancelled: 0,
  };
  return statusMap[status.toLowerCase()] || 0;
};

const formatCurrency = (amount: number, currency: string = "THB"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

const formatDateShort = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const capitalizeStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export function OrdersList() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders");
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-destructive">{error}</p>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
        <p className="text-muted-foreground mb-4">
          Start by requesting quotes from OEMs
        </p>
        <Button asChild>
          <Link href="/oems">Browse OEMs</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const totalItems = order.order_line_items.reduce(
          (sum, item) => sum + (item.quantity || 0),
          0
        );

        return (
          <Card key={order.id} className="p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <Package className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">
                    {order.oem_organization?.display_name || "OEM"}
                  </h3>
                  <Badge>{capitalizeStatus(order.status)}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Order ID: {order.id.slice(0, 8)}... • Items: {totalItems} •
                  Total:{" "}
                  {formatCurrency(
                    Number(order.total_value || 0),
                    order.currency
                  )}
                </p>

                {/* Progress */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{ORDER_STEPS[0]}</span>
                    <span>{ORDER_STEPS[ORDER_STEPS.length - 1]}</span>
                  </div>
                  <Progress value={getOrderPercent(order.status)} />
                </div>

                {/* Timeline summary */}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {ORDER_STEPS.map((step) => {
                    const isActive =
                      step.toLowerCase() === order.status.toLowerCase();
                    const stepEvent = order.order_events.find(
                      (e) => e.stage?.toLowerCase() === step.toLowerCase()
                    );

                    return (
                      <span
                        key={step}
                        className={`px-2 py-0.5 rounded border ${
                          isActive
                            ? "border-primary text-primary"
                            : "border-muted-foreground/20"
                        }`}
                      >
                        {step}
                        {stepEvent && (
                          <span className="ml-1 opacity-70">
                            • {formatDateShort(stepEvent.created_at)}
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="shrink-0 text-right space-y-2">
                {order.tracking_number && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1 justify-end">
                    <Truck className="h-4 w-4" />
                    <span>{order.shipping_provider}</span>
                    <span>•</span>
                    <span>{order.tracking_number}</span>
                  </div>
                )}

                <Button asChild size="sm">
                  <Link href={`/orders/${order.id}`}>View Details</Link>
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
