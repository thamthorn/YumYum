"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Wallet, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function OEMFinancialStats() {
  const { toast } = useToast();

  const {
    data: financials,
    isLoading,
  } = useQuery({
    queryKey: ["oem-financials"],
    queryFn: async () => {
      const response = await fetch("/api/oem/financials");
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // If user is not an OEM, return null to hide component
        if (
          response.status === 404 ||
          errorData.error?.message?.includes("OEM organization not found")
        ) {
          return null;
        }
        throw new Error(
          errorData.error?.message || "Failed to load financial data"
        );
      }
      const body = await response.json();
      return body.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: false, // Don't retry if user is not an OEM
  });

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2,
    }).format(num);
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-20 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  // If user is not an OEM or no financial data, don't show the component
  if (!financials) {
    return null;
  }

  const stats = [
    {
      label: "Available to Withdraw",
      value: formatCurrency(financials.availableBalance || 0),
      icon: Wallet,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Money in Escrow",
      value: formatCurrency(financials.escrowBalance || 0),
      icon: Lock,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      label: "Total Earnings",
      value: formatCurrency(financials.totalEarnings || 0),
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Pending Withdrawals",
      value: formatCurrency(financials.pendingWithdrawals || 0),
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  const handleWithdraw = () => {
    // TODO: Open withdrawal dialog/modal
    toast({
      title: "Withdrawal",
      description: "Withdrawal feature coming soon!",
    });
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-semibold">Financial Overview</h2>
          <p className="text-sm text-muted-foreground">
            {financials.organizationName && (
              <span className="font-medium text-foreground">
                {financials.organizationName}
              </span>
            )}{" "}
            {financials.organizationName ? "• " : ""}Manage your earnings and
            withdrawals
          </p>
        </div>
        {parseFloat(financials.availableBalance || "0") > 0 && (
          <Button onClick={handleWithdraw}>
            <Wallet className="mr-2 h-4 w-4" />
            Request Withdrawal
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card
            key={stat.label}
            className="p-6 animate-scale-in"
            style={{
              animationDelay: `${index * 50}ms` as unknown as string,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Recent Transactions Summary */}
      {financials.totalTransactions > 0 && (
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="font-medium">
                {financials.totalTransactions}
              </span>{" "}
              completed transactions
              {financials.activeEscrows > 0 && (
                <>
                  {" • "}
                  <span className="font-medium">
                    {financials.activeEscrows}
                  </span>{" "}
                  active escrows
                </>
              )}
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="#transactions">View Details</a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
