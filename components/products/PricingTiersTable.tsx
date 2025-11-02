"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, Infinity } from "lucide-react";

type PricingTier = {
  min_quantity: number;
  max_quantity: number | null;
  unit_price: number;
  currency: string;
};

interface PricingTiersTableProps {
  pricingTiers: PricingTier[];
}

export default function PricingTiersTable({
  pricingTiers,
}: PricingTiersTableProps) {
  // Sort by min_quantity ascending
  const sortedTiers = [...pricingTiers].sort(
    (a, b) => a.min_quantity - b.min_quantity
  );

  // Calculate savings percentage for each tier
  const highestPrice = sortedTiers[0]?.unit_price || 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <TrendingDown className="w-5 h-5 text-green-600" />
        <h4 className="font-semibold">Volume Pricing Tiers</h4>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quantity Range</TableHead>
              <TableHead className="text-right">Price per Unit</TableHead>
              <TableHead className="text-right">Total Cost</TableHead>
              <TableHead className="text-right">Savings</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTiers.map((tier, index) => {
              const savings =
                highestPrice > 0
                  ? ((highestPrice - tier.unit_price) / highestPrice) * 100
                  : 0;

              // Example total for min quantity
              const exampleTotal = tier.unit_price * tier.min_quantity;

              return (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {tier.min_quantity.toLocaleString()}
                    {" - "}
                    {tier.max_quantity ? (
                      tier.max_quantity.toLocaleString()
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <Infinity className="w-4 h-4" />
                      </span>
                    )}{" "}
                    units
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${tier.unit_price.toFixed(2)}
                    <span className="text-xs text-muted-foreground ml-1">
                      {tier.currency}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    $
                    {exampleTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    <div className="text-xs">
                      (for {tier.min_quantity.toLocaleString()})
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {savings > 0 ? (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                      >
                        Save {savings.toFixed(1)}%
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Base price
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        * Prices shown are per unit. Higher quantities unlock better pricing.
      </p>
    </div>
  );
}
