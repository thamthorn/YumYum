import { CheckCircle2, Circle, Clock } from "lucide-react";

export type PaymentEvent = {
  id: string;
  type: "deposit" | "balance" | "service_fee" | "release" | "refund";
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed";
  timestamp: string;
  description?: string;
};

interface PaymentTimelineProps {
  events: PaymentEvent[];
}

export function PaymentTimeline({ events }: PaymentTimelineProps) {
  const formatCurrency = (amount: number, currency: string = "THB") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventLabel = (type: PaymentEvent["type"]): string => {
    const labels: Record<PaymentEvent["type"], string> = {
      deposit: "Deposit Payment (30%)",
      balance: "Balance Payment (70%)",
      service_fee: "Service Fee Deducted",
      release: "Payment Released to OEM",
      refund: "Refund Processed",
    };
    return labels[type];
  };

  const getEventIcon = (status: PaymentEvent["status"]) => {
    if (status === "completed") {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }
    if (status === "pending") {
      return <Clock className="h-5 w-5 text-yellow-600 animate-pulse" />;
    }
    return <Circle className="h-5 w-5 text-gray-400" />;
  };

  // Unused - kept for future implementation
  // const getEventColor = (status: PaymentEvent["status"]) => {
  //   if (status === "completed") return "border-green-600";
  //   if (status === "pending") return "border-yellow-600";
  //   return "border-gray-400";
  // };

  if (events.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Clock className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
        <p className="text-sm">No payment history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-4">
          {/* Timeline icon */}
          <div className="relative flex flex-col items-center">
            <div className="shrink-0">{getEventIcon(event.status)}</div>
            {index < events.length - 1 && (
              <div
                className={`w-0.5 h-full mt-2 ${
                  event.status === "completed" ? "bg-green-600" : "bg-gray-300"
                }`}
              />
            )}
          </div>

          {/* Event details */}
          <div className="flex-1 pb-8">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-sm">
                  {getEventLabel(event.type)}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(event.timestamp)}
                </p>
                {event.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {event.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p
                  className={`font-semibold ${
                    event.type === "refund" || event.type === "service_fee"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {event.type === "refund" || event.type === "service_fee"
                    ? "-"
                    : "+"}
                  {formatCurrency(event.amount, event.currency)}
                </p>
                <span
                  className={`text-xs ${
                    event.status === "completed"
                      ? "text-green-600"
                      : event.status === "pending"
                        ? "text-yellow-600"
                        : "text-gray-500"
                  }`}
                >
                  {event.status === "completed"
                    ? "✓ Completed"
                    : event.status === "pending"
                      ? "⏳ Pending"
                      : "✕ Failed"}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
