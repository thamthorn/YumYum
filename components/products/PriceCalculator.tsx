"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingDown, DollarSign, Calculator, Sparkles } from "lucide-react";

type PricingTier = {
  min_quantity: number;
  max_quantity: number | null;
  unit_price: number;
  currency: string;
};

interface PriceCalculatorProps {
  pricingTiers: PricingTier[];
  moq?: number | null;
}

export default function PriceCalculator({
  pricingTiers,
  moq,
}: PriceCalculatorProps) {
  const [quantity, setQuantity] = useState<string>(
    moq ? moq.toString() : pricingTiers[0]?.min_quantity.toString() || "1000"
  );

  const quantityNum = parseInt(quantity) || 0;

  // Find applicable price tier
  const currentTier = pricingTiers.find(
    (tier) =>
      quantityNum >= tier.min_quantity &&
      (tier.max_quantity === null || quantityNum <= tier.max_quantity)
  );

  // Find next tier for savings preview
  const nextTier = pricingTiers.find(
    (tier) => currentTier && tier.min_quantity > currentTier.min_quantity
  );

  const currentPrice = currentTier?.unit_price || 0;
  const totalCost = currentPrice * quantityNum;

  // Calculate savings vs. highest tier
  const highestTierPrice = pricingTiers[0]?.unit_price || 0;
  const savings =
    currentPrice < highestTierPrice
      ? (highestTierPrice - currentPrice) * quantityNum
      : 0;
  const savingsPercentage =
    highestTierPrice > 0
      ? ((highestTierPrice - currentPrice) / highestTierPrice) * 100
      : 0;

  // Next tier savings
  const nextTierSavings = nextTier
    ? (currentPrice - nextTier.unit_price) * nextTier.min_quantity
    : 0;

  return (
    <div className="space-y-4">
      {/* Quantity Input */}
      <div className="space-y-2">
        <Label htmlFor="quantity" className="flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          Calculate Your Price
        </Label>
        <Input
          id="quantity"
          type="number"
          placeholder="Enter quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min={moq || 1}
          className="text-lg"
        />
        {moq && quantityNum < moq && (
          <p className="text-xs text-destructive">
            Minimum order quantity is {moq.toLocaleString()} units
          </p>
        )}
      </div>

      {/* Price Display */}
      {quantityNum > 0 && currentTier && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="space-y-3">
            {/* Unit Price */}
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">
                Price per unit:
              </span>
              <div className="flex items-baseline gap-1">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-2xl font-bold text-primary">
                  {currentPrice.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {currentTier.currency}
                </span>
              </div>
            </div>

            {/* Total Cost */}
            <div className="flex items-baseline justify-between pt-3 border-t">
              <span className="text-sm font-medium">Total Cost:</span>
              <span className="text-xl font-bold">
                $
                {totalCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            {/* Quantity Range */}
            <div className="text-xs text-muted-foreground text-center">
              Price tier: {currentTier.min_quantity.toLocaleString()}-
              {currentTier.max_quantity?.toLocaleString() || "∞"} units
            </div>
          </div>
        </Card>
      )}

      {/* Savings Display */}
      {savings > 0 && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
          <TrendingDown className="w-4 h-4" />
          <span>
            You save{" "}
            <strong>
              $
              {savings.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </strong>{" "}
            ({savingsPercentage.toFixed(1)}%) vs. lowest quantity tier
          </span>
        </div>
      )}

      {/* Next Tier Preview */}
      {nextTier && quantityNum < nextTier.min_quantity && (
        <div className="flex items-start gap-2 text-sm text-blue-600 bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
          <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            Order <strong>{nextTier.min_quantity.toLocaleString()}</strong>{" "}
            units to unlock ${nextTier.unit_price.toFixed(2)}/unit and save an
            additional{" "}
            <strong>
              $
              {nextTierSavings.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </strong>
          </span>
        </div>
      )}
    </div>
  );
}
