"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Building2,
  Wallet,
  Shield,
  Info,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export interface PaymentBreakdown {
  subtotal: number;
  deposit: number; // 30%
  balance: number; // 70%
  serviceFee: number; // 5%
  totalToOEM: number;
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
  escrowEnabled?: boolean;
  onPaymentComplete?: () => void;
}

type PaymentMethod = "credit-card" | "bank-transfer" | "paypal";

export function PaymentModal({
  open,
  onOpenChange,
  orderId,
  orderNumber,
  total,
  currency,
  paymentType,
  breakdown: providedBreakdown,
  escrowEnabled = true,
  onPaymentComplete,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>("credit-card");
  const [useEscrow, setUseEscrow] = useState(escrowEnabled);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate breakdown if not provided
  const breakdown: PaymentBreakdown = providedBreakdown || {
    subtotal: total,
    deposit: total * 0.3,
    balance: total * 0.7,
    serviceFee: total * 0.05,
    totalToOEM: total * 0.95,
    totalFromBuyer: total,
    currency: currency,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: breakdown.currency,
    }).format(amount);
  };

  const paymentAmount =
    paymentType === "deposit" ? breakdown.deposit : breakdown.balance;

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
          useEscrow,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error?.message || "การชำระเงินล้มเหลว");
      }

      const result = await response.json();
      const { payment, escrow, order: orderUpdate } = result.data;

      // Show success toast
      if (escrow) {
        const percentage = paymentType === "deposit" ? "30%" : "70%";
        toast.success(
          `ยอดเงิน ${percentage} (${formatCurrency(payment.amount)}) จะถูกพักไว้ในระบบ Escrow จนกว่าคุณจะยืนยันการรับสินค้า`,
          {
            description: `เงินของคุณได้รับการปกป้องอย่างปลอดภัย | Order status: ${orderUpdate.newStatus}`,
            duration: 5000,
          }
        );
      } else {
        toast.success(`ชำระเงินสำเร็จ ${formatCurrency(payment.amount)}`, {
          description: `เงินจะถูกโอนให้ OEM ทันที | Order status: ${orderUpdate.newStatus}`,
        });
      }

      setIsProcessing(false);
      onOpenChange(false);
      onPaymentComplete?.();
    } catch (error) {
      setIsProcessing(false);
      toast.error(
        error instanceof Error ? error.message : "การชำระเงินล้มเหลว"
      );
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
            <CreditCard className="h-5 w-5" />
            {paymentType === "deposit"
              ? "Pay 30% deposit to start production"
              : "Pay remaining 70% balance before shipment"}
          </DialogTitle>
          <DialogDescription>
            Order #{orderNumber.slice(0, 8)}
          </DialogDescription>
        </DialogHeader>

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
            <div className="pt-1.5 border-t">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Service Fee (5%):</span>
                <span>{formatCurrency(breakdown.serviceFee)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                <span>OEM Receives:</span>
                <span>{formatCurrency(breakdown.totalToOEM)}</span>
              </div>
            </div>
          </div>

          {/* Escrow Protection */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="escrow"
                checked={useEscrow}
                onCheckedChange={(checked) => setUseEscrow(checked as boolean)}
              />
              <div className="flex-1">
                <Label
                  htmlFor="escrow"
                  className="cursor-pointer font-medium flex items-center gap-2"
                >
                  <Shield className="h-4 w-4 text-blue-600" />
                  Escrow Protection Enabled
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Your payment will be held securely until you confirm delivery.
                  Recommended for all transactions.
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
              You will pay <strong>{formatCurrency(paymentAmount)}</strong>.{" "}
              {useEscrow
                ? "This amount will be held in escrow until delivery confirmation."
                : "This amount will be transferred directly to the OEM."}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
