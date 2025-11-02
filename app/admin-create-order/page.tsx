"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import ProtectedClient from "@/components/ProtectedClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Package, Plus, Trash2 } from "lucide-react";

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
  oem_org_id: string | null;
  oem: {
    id: string;
    name: string;
    slug: string | null;
    industry: string | null;
    location: string | null;
  } | null;
};

type LineItem = {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
};

export default function AdminCreateOrderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 0, unit: "pieces", unit_price: 0 },
  ]);
  const [orderStatus, setOrderStatus] = useState("signed");

  // Fetch all requests
  const { data: requests = [], isLoading } = useQuery<RequestResponse[]>({
    queryKey: ["admin-requests"],
    queryFn: async () => {
      const response = await fetch("/api/requests");
      if (!response.ok) {
        throw new Error("Failed to load requests");
      }
      const body = await response.json();
      return body.data ?? [];
    },
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: {
      request_id: string;
      status: string;
      line_items: LineItem[];
    }) => {
      const response = await fetch("/api/admin-create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create order");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success("Order created successfully!");
      queryClient.invalidateQueries({ queryKey: ["buyer-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });

      // Navigate to the created order
      if (data.order?.id) {
        router.push(`/orders/${data.order.id}`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const selectedRequest = requests.find((r) => r.id === selectedRequestId);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { description: "", quantity: 0, unit: "pieces", unit_price: 0 },
    ]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (
    index: number,
    field: keyof LineItem,
    value: string | number
  ) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const calculateTotal = () => {
    return lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
  };

  const handleCreateOrder = () => {
    if (!selectedRequestId) {
      toast.error("Please select a request");
      return;
    }

    if (lineItems.length === 0 || lineItems.some((item) => !item.description)) {
      toast.error("Please add at least one valid line item");
      return;
    }

    createOrderMutation.mutate({
      request_id: selectedRequestId,
      status: orderStatus,
      line_items: lineItems,
    });
  };

  return (
    <ProtectedClient>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="pt-24 pb-12">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Package className="h-8 w-8 text-primary" />
                🔧 Admin: Create Order from Request
              </h1>
              <p className="text-muted-foreground">
                Hidden testing route - Create orders from existing requests
              </p>
            </div>

            {/* Select Request */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">1. Select Request</h2>
              {isLoading ? (
                <p className="text-muted-foreground">Loading requests...</p>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="request-select">Request</Label>
                    <Select
                      value={selectedRequestId}
                      onValueChange={setSelectedRequestId}
                    >
                      <SelectTrigger id="request-select">
                        <SelectValue placeholder="Select a request" />
                      </SelectTrigger>
                      <SelectContent>
                        {requests.map((request) => (
                          <SelectItem key={request.id} value={request.id}>
                            {request.title || "Untitled"} -{" "}
                            {request.oem?.name || "No OEM"} ({request.status})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedRequest && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-semibold mb-2">Request Details</h3>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">OEM:</span>{" "}
                          {selectedRequest.oem?.name || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Product:</span>{" "}
                          {selectedRequest.productBrief || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Quantity:</span>{" "}
                          {selectedRequest.quantityMin?.toLocaleString()} -{" "}
                          {selectedRequest.quantityMax?.toLocaleString()}{" "}
                          {selectedRequest.unit}
                        </p>
                        <p>
                          <span className="font-medium">Timeline:</span>{" "}
                          {selectedRequest.timeline || "N/A"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Order Status */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">2. Order Status</h2>
              <div className="space-y-2">
                <Label htmlFor="status-select">Status</Label>
                <Select value={orderStatus} onValueChange={setOrderStatus}>
                  <SelectTrigger id="status-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="signed">Signed (To Pay)</SelectItem>
                    <SelectItem value="processing">
                      Processing (Ordered)
                    </SelectItem>
                    <SelectItem value="preparation">
                      Preparation (Ordered)
                    </SelectItem>
                    <SelectItem value="in_production">
                      In Production (Ordered)
                    </SelectItem>
                    <SelectItem value="manufacturing">
                      Manufacturing (Ordered)
                    </SelectItem>
                    <SelectItem value="delivering">
                      Delivering (Ordered)
                    </SelectItem>
                    <SelectItem value="in_transit">
                      In Transit (Ordered)
                    </SelectItem>
                    <SelectItem value="delivered">
                      Delivered (History)
                    </SelectItem>
                    <SelectItem value="completed">
                      Completed (History)
                    </SelectItem>
                    <SelectItem value="cancelled">
                      Cancelled (History)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  • <strong>To Pay tab:</strong> signed
                  <br />• <strong>Ordered tab:</strong> processing, preparation,
                  in_production, manufacturing, delivering, in_transit
                  <br />• <strong>History tab:</strong> delivered, completed,
                  cancelled
                </p>
              </div>
            </Card>

            {/* Line Items */}
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">3. Order Line Items</h2>
                <Button size="sm" onClick={addLineItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {lineItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg space-y-3 relative"
                  >
                    {lineItems.length > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => removeLineItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor={`description-${index}`}>
                        Description
                      </Label>
                      <Textarea
                        id={`description-${index}`}
                        value={item.description}
                        onChange={(e) =>
                          updateLineItem(index, "description", e.target.value)
                        }
                        placeholder="e.g., Custom T-Shirt - Premium Cotton"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          value={item.quantity || ""}
                          onChange={(e) =>
                            updateLineItem(
                              index,
                              "quantity",
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="1000"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`unit-${index}`}>Unit</Label>
                        <Input
                          id={`unit-${index}`}
                          value={item.unit}
                          onChange={(e) =>
                            updateLineItem(index, "unit", e.target.value)
                          }
                          placeholder="pieces"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`unit-price-${index}`}>
                          Unit Price (THB)
                        </Label>
                        <Input
                          id={`unit-price-${index}`}
                          type="number"
                          step="0.01"
                          value={item.unit_price || ""}
                          onChange={(e) =>
                            updateLineItem(
                              index,
                              "unit_price",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="50.00"
                        />
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Subtotal: ฿
                      {(item.quantity * item.unit_price).toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    ฿
                    {calculateTotal().toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </Card>

            {/* Create Button */}
            <Card className="p-6">
              <Button
                size="lg"
                className="w-full"
                onClick={handleCreateOrder}
                disabled={!selectedRequestId || createOrderMutation.isPending}
              >
                {createOrderMutation.isPending
                  ? "Creating Order..."
                  : "Create Order"}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedClient>
  );
}
