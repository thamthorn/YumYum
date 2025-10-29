"use client";

import { Suspense } from "react";
import Navigation from "@/components/Navigation";
import ProtectedClient from "@/components/ProtectedClient";
import { OrdersList } from "@/components/OrdersList";

export default function OrdersPage() {
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

              <OrdersList />
            </div>
          </section>
        </div>
      </ProtectedClient>
    </Suspense>
  );
}
