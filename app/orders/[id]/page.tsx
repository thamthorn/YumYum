"use client";

import { Suspense, use } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import ProtectedClient from "@/components/ProtectedClient";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Package, ArrowLeft, Truck } from "lucide-react";
import {
  ROUTES,
  getOrderById,
  ORDER_STEPS,
  orderPercent,
  formatCurrency,
  formatDate,
  formatDateShort,
} from "@/data/MockData";

function OrderClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const order = getOrderById(id);

  if (!order) {
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

  return (
    <ProtectedClient>
      <div className="min-h-screen bg-background">
        <Navigation />

        <section className="pt-24 pb-12">
          <div className="container mx-auto max-w-5xl space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Package className="h-5 w-5 text-primary" />
                  <h1 className="text-2xl font-bold">{order.oemName}</h1>
                  <Badge>{order.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Order ID: {order.id} • Items: {order.quantityTotal} • Total:{" "}
                  {formatCurrency(order.total)}
                </p>
              </div>
              <div className="shrink-0">
                <Button variant="outline" size="sm" asChild>
                  <Link href={ROUTES.orders}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
                  </Link>
                </Button>
              </div>
            </div>

            {/* Progress */}
            <Card className="p-6">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>{ORDER_STEPS[0]}</span>
                <span>{ORDER_STEPS[ORDER_STEPS.length - 1]}</span>
              </div>
              <Progress value={orderPercent(order.status)} />
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {ORDER_STEPS.map((step) => (
                  <span
                    key={step}
                    className={`px-2 py-0.5 rounded border ${step === order.status ? "border-primary text-primary" : "border-muted-foreground/20"}`}
                  >
                    {step}
                    {order.timeline?.[step as keyof typeof order.timeline] && (
                      <span className="ml-1 opacity-70">
                        •{" "}
                        {formatDateShort(
                          order.timeline?.[
                            step as keyof typeof order.timeline
                          ] as string
                        )}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </Card>

            {/* Shipping Info */}
            {(order.shippingProvider ||
              order.trackingNumber ||
              order.estimatedDelivery) && (
              <Card className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold mb-2">Shipping</h2>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {order.shippingProvider && (
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          <span>Provider:</span>
                          <span className="text-foreground">
                            {order.shippingProvider}
                          </span>
                        </div>
                      )}
                      {order.trackingNumber && (
                        <div>
                          Tracking:{" "}
                          <span className="text-foreground">
                            {order.trackingNumber}
                          </span>
                        </div>
                      )}
                      {order.estimatedDelivery && (
                        <div>
                          Estimated Delivery:{" "}
                          <span className="text-foreground">
                            {formatDate(order.estimatedDelivery)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <Badge variant="secondary">{order.status}</Badge>
                  </div>
                </div>
              </Card>
            )}

            {/* Items */}
            <Card className="p-0 overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="font-semibold">Items</h2>
              </div>
              <div className="divide-y">
                <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs text-muted-foreground">
                  <div className="col-span-6">Item</div>
                  <div className="col-span-2 text-right">Qty</div>
                  <div className="col-span-2 text-right">Unit</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>
                {order.items.map((item) => (
                  <div
                    key={item.sku}
                    className="grid grid-cols-12 gap-4 px-6 py-4 text-sm"
                  >
                    <div className="col-span-6">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        SKU: {item.sku}
                      </div>
                    </div>
                    <div className="col-span-2 text-right">
                      {item.quantity.toLocaleString()}
                    </div>
                    <div className="col-span-2 text-right">
                      {formatCurrency(item.unitPrice)}
                    </div>
                    <div className="col-span-2 text-right">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Totals */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-6">
                <h2 className="font-semibold mb-2">Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatCurrency(order.shippingFee ?? 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatCurrency(order.tax ?? 0)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </Card>
              {order.notes && (
                <Card className="p-6">
                  <h2 className="font-semibold mb-2">Notes</h2>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {order.notes}
                  </p>
                </Card>
              )}
            </div>
          </div>
        </section>
      </div>
    </ProtectedClient>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <OrderClient params={params} />
    </Suspense>
  );
}
