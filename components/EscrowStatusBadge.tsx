import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle2, Clock, AlertCircle } from "lucide-react";

type EscrowStatus = "pending" | "held" | "released" | "refunded" | "none";

interface EscrowStatusBadgeProps {
  status: EscrowStatus;
  amount?: number;
  currency?: string;
}

export function EscrowStatusBadge({
  status,
  amount,
  currency = "THB",
}: EscrowStatusBadgeProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(value);
  };

  const statusConfig: Record<
    EscrowStatus,
    {
      label: string;
      icon: React.ReactNode;
      className: string;
      description?: string;
    }
  > = {
    pending: {
      label: "Payment Pending",
      icon: <Clock className="h-3 w-3 mr-1" />,
      className: "bg-yellow-50 text-yellow-700 border-yellow-300",
      description: "Awaiting payment",
    },
    held: {
      label: "Escrow Protected",
      icon: <Shield className="h-3 w-3 mr-1" />,
      className: "bg-blue-50 text-blue-700 border-blue-300",
      description: amount
        ? `${formatCurrency(amount)} held securely`
        : "Funds held securely",
    },
    released: {
      label: "Payment Released",
      icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
      className: "bg-green-50 text-green-700 border-green-300",
      description: "Funds transferred to OEM",
    },
    refunded: {
      label: "Refunded",
      icon: <AlertCircle className="h-3 w-3 mr-1" />,
      className: "bg-gray-50 text-gray-700 border-gray-300",
      description: amount
        ? `${formatCurrency(amount)} refunded`
        : "Payment refunded",
    },
    none: {
      label: "No Escrow",
      icon: null,
      className: "bg-gray-50 text-gray-600 border-gray-200",
      description: "Direct payment",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="inline-flex flex-col gap-1">
      <Badge variant="outline" className={config.className}>
        {config.icon}
        {config.label}
      </Badge>
      {config.description && (
        <span className="text-xs text-muted-foreground">
          {config.description}
        </span>
      )}
    </div>
  );
}
