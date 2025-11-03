"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Building2,
  Wallet,
  Shield,
  Info,
  Loader2,
  Truck,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

export interface PaymentBreakdown {
  subtotal: number;
  deposit: number; // 30%
  balance: number; // 70%
  shippingFee: number; // Shipping fee
  totalFromBuyer: number;
  currency: string;
}

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderNumber: string;
  total: number;
  currency: string;
  paymentType: "deposit" | "balance";
  breakdown?: PaymentBreakdown;
  onPaymentComplete?: () => void;
}

type PaymentMethod = "credit-card" | "bank-transfer" | "paypal";
type ShippingPreference = "oem-location" | "buyer-address";

export function PaymentModal({
  open,
  onOpenChange,
  orderId,
  orderNumber,
  total,
  currency,
  paymentType,
  breakdown: providedBreakdown,
  onPaymentComplete,
}: PaymentModalProps) {
  const [currentStep, setCurrentStep] = useState<"shipping" | "payment">(
    paymentType === "balance" ? "shipping" : "payment"
  );
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>("credit-card");
  const [isProcessing, setIsProcessing] = useState(false);

  // Shipping states
  const [shippingPreference, setShippingPreference] =
    useState<ShippingPreference>("oem-location");
  const [buyerAddress, setBuyerAddress] = useState("");

  // Reset step when modal opens or payment type changes
  useEffect(() => {
    if (open) {
      setCurrentStep(paymentType === "balance" ? "shipping" : "payment");
    }
  }, [open, paymentType]);

  // Calculate shipping fee based on current selection
  const currentShippingFee =
    paymentType === "balance" && shippingPreference === "buyer-address"
      ? total * 0.05
      : 0;

  // Calculate breakdown - use current shipping fee for balance payments
  const breakdown: PaymentBreakdown = providedBreakdown || {
    subtotal: total,
    deposit: total * 0.3,
    balance: total * 0.7,
    shippingFee: currentShippingFee,
    totalFromBuyer: total + currentShippingFee,
    currency: currency,
  };

  // Override shipping fee in breakdown for balance payments
  if (paymentType === "balance") {
    breakdown.shippingFee = currentShippingFee;
    breakdown.totalFromBuyer = total + currentShippingFee;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: breakdown.currency,
    }).format(amount);
  };

  const paymentAmount =
    paymentType === "deposit"
      ? breakdown.deposit
      : breakdown.balance + currentShippingFee;

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Call mock payment endpoint (creates real database records)
      const response = await fetch(`/api/orders/${orderId}/mock-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentType,
          amount: paymentAmount,
          currency: breakdown.currency,
          paymentMethod: selectedMethod,
          useEscrow: true, // Always use escrow
          shippingPreference:
            paymentType === "balance" ? shippingPreference : undefined,
          buyerAddress:
            paymentType === "balance" && shippingPreference === "buyer-address"
              ? buyerAddress
              : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error?.message || "การชำระเงินล้มเหลว");
      }

      const result = await response.json();
      const { payment, order: orderUpdate } = result.data;

      // Show success toast
      const percentage = paymentType === "deposit" ? "30%" : "70%";
      toast.success(
        `ยอดเงิน ${percentage} (${formatCurrency(payment.amount)}) จะถูกพักไว้ในระบบ Escrow จนกว่าคุณจะยืนยันการรับสินค้า`,
        {
          description: `เงินของคุณได้รับการปกป้องอย่างปลอดภัย | Order status: ${orderUpdate.newStatus}`,
          duration: 5000,
        }
      );

      setIsProcessing(false);
      onOpenChange(false);
      setCurrentStep(paymentType === "balance" ? "shipping" : "payment");
      onPaymentComplete?.();
    } catch (error) {
      setIsProcessing(false);
      toast.error(
        error instanceof Error ? error.message : "การชำระเงินล้มเหลว"
      );
    }
  };

  const handleNext = () => {
    if (currentStep === "shipping") {
      if (shippingPreference === "buyer-address" && !buyerAddress.trim()) {
        toast.error("Please enter your delivery address");
        return;
      }
      setCurrentStep("payment");
    }
  };

  const paymentMethods = [
    {
      id: "credit-card" as PaymentMethod,
      name: "Credit/Debit Card",
      icon: <CreditCard className="h-5 w-5" />,
      description: "Visa, Mastercard, Amex",
    },
    {
      id: "bank-transfer" as PaymentMethod,
      name: "Bank Transfer",
      icon: <Building2 className="h-5 w-5" />,
      description: "Direct bank transfer",
    },
    {
      id: "paypal" as PaymentMethod,
      name: "PayPal",
      icon: <Wallet className="h-5 w-5" />,
      description: "Pay with PayPal",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {currentStep === "shipping" ? (
              <>
                <Truck className="h-5 w-5" />
                Shipping Information
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                {paymentType === "deposit"
                  ? "Pay 30% deposit to start production"
                  : "Pay remaining 70% balance before shipment"}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            Order #{orderNumber.slice(0, 8)}
            {paymentType === "balance" && (
              <span className="ml-2">
                • Step {currentStep === "shipping" ? "1" : "2"} of 2
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {currentStep === "shipping" && paymentType === "balance" && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="shipping-pref">Shipping Preferences</Label>
              <Select
                value={shippingPreference}
                onValueChange={(value: ShippingPreference) =>
                  setShippingPreference(value)
                }
              >
                <SelectTrigger id="shipping-pref">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oem-location">
                    Receive at OEM location
                  </SelectItem>
                  <SelectItem value="buyer-address">
                    Deliver to my address
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {shippingPreference === "buyer-address" && (
              <div className="space-y-2">
                <Label htmlFor="buyer-address">Delivery Address</Label>
                <Textarea
                  id="buyer-address"
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  placeholder="Enter your complete delivery address..."
                  rows={4}
                />
              </div>
            )}

            <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Balance (70%):</span>
                <span className="font-medium">
                  {formatCurrency(breakdown.balance)}
                </span>
              </div>
              {shippingPreference === "buyer-address" && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping Fee:</span>
                  <span className="font-medium">
                    {formatCurrency(currentShippingFee)}
                  </span>
                </div>
              )}
              <div className="pt-1.5 border-t">
                <div className="flex justify-between font-semibold">
                  <span>Total to Pay:</span>
                  <span>{formatCurrency(paymentAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === "payment" && (
          <div className="space-y-4 py-2">
            {/* Payment Breakdown */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order Total:</span>
                <span className="font-medium">
                  {formatCurrency(breakdown.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Deposit (30%):{" "}
                  {paymentType === "deposit" && (
                    <Badge variant="default" className="ml-2">
                      Pay Now
                    </Badge>
                  )}
                </span>
                <span className="font-medium">
                  {formatCurrency(breakdown.deposit)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Balance (70%):{" "}
                  {paymentType === "balance" && (
                    <Badge variant="default" className="ml-2">
                      Pay Now
                    </Badge>
                  )}
                </span>
                <span className="font-medium">
                  {formatCurrency(breakdown.balance)}
                </span>
              </div>
              {paymentType === "balance" &&
                shippingPreference === "buyer-address" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping Fee:</span>
                    <span className="font-medium">
                      {formatCurrency(breakdown.shippingFee)}
                    </span>
                  </div>
                )}
            </div>

            {/* Escrow Protection - Always enabled */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <Label className="font-medium flex items-center gap-2">
                    Escrow Protection Enabled
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your payment will be held securely until you confirm
                    delivery. All transactions are protected.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-2">
              <Label className="text-sm">Payment Method</Label>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`w-full p-2.5 rounded-lg border-2 transition-all text-left ${
                      selectedMethod === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {method.icon}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{method.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {method.description}
                        </p>
                      </div>
                      {selectedMethod === method.id && (
                        <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="flex gap-2 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                You will pay <strong>{formatCurrency(paymentAmount)}</strong>.
                This amount will be held in escrow until delivery confirmation.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          {currentStep === "payment" && paymentType === "balance" && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep("shipping")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          {currentStep === "shipping" ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleNext}>Continue to Payment</Button>
            </>
          ) : (
            <>
              {paymentType === "deposit" && (
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
              )}
              <Button onClick={handlePayment} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay {formatCurrency(paymentAmount)}</>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
