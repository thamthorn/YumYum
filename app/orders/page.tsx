"use client";

import { Suspense } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import ProtectedClient from "@/components/ProtectedClient";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Package, Truck } from "lucide-react";
import {
  ROUTES,
  getOrdersByBuyer,
  ORDER_STEPS,
  orderPercent,
  formatCurrency,
  formatDateShort,
} from "@/data/MockData";

export default function OrdersPage() {
  const orders = getOrdersByBuyer("buyer-001");

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ProtectedClient>
        <div className="min-h-screen bg-background">
          <Navigation />

          <section className="pt-24 pb-12">
            <div className="container mx-auto max-w-5xl">
              <div className="mb-8">
                <h1 className="text-3xl font-bold">Orders</h1>
                <p className="text-muted-foreground">
                  Track your manufacturing orders and their progress
                </p>
              </div>

              <div className="space-y-4">
                {orders.map((order) => (
                  <Card
                    key={order.id}
                    className="p-6 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <Package className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-semibold">
                            {order.oemName}
                          </h3>
                          <Badge>{order.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Order ID: {order.id} • Items: {order.quantityTotal} •
                          Total: {formatCurrency(order.total)}
                        </p>

                        {/* Progress */}
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>{ORDER_STEPS[0]}</span>
                            <span>{ORDER_STEPS[ORDER_STEPS.length - 1]}</span>
                          </div>
                          <Progress value={orderPercent(order.status)} />
                        </div>

                        {/* Timeline summary */}
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {ORDER_STEPS.map((step) => (
                            <span
                              key={step}
                              className={`px-2 py-0.5 rounded border ${step === order.status ? "border-primary text-primary" : "border-muted-foreground/20"}`}
                            >
                              {step}
                              {order.timeline?.[
                                step as keyof typeof order.timeline
                              ] && (
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
                      </div>

                      <div className="shrink-0 text-right space-y-2">
                        {order.trackingNumber && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1 justify-end">
                            <Truck className="h-4 w-4" />
                            <span>{order.shippingProvider}</span>
                            <span>•</span>
                            <span>{order.trackingNumber}</span>
                          </div>
                        )}
                        <Button size="sm" asChild>
                          <Link href={ROUTES.orderDetail(order.id)}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                {orders.length === 0 && (
                  <Card className="p-12 text-center text-muted-foreground">
                    No orders yet.
                  </Card>
                )}
              </div>
            </div>
          </section>
        </div>
      </ProtectedClient>
    </Suspense>
  );
}
