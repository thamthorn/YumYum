"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Clock, TrendingDown } from "lucide-react";
import type { Database } from "@/types/database";

type Product = Database["public"]["Tables"]["products"]["Row"] & {
  product_pricing?: Array<{
    min_quantity: number;
    max_quantity: number | null;
    unit_price: number;
    currency: string;
  }>;
  product_images?: Array<{
    image_url: string;
    alt_text: string | null;
    is_primary: boolean;
  }>;
};

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export default function ProductCard({
  product,
  onViewDetails,
}: ProductCardProps) {
  // Get the lowest price tier for display
  const lowestPrice = product.product_pricing?.[0];
  const priceRange =
    product.product_pricing && product.product_pricing.length > 1
      ? `$${product.product_pricing[product.product_pricing.length - 1].unit_price.toFixed(2)} - $${product.product_pricing[0].unit_price.toFixed(2)}`
      : lowestPrice
        ? `From $${lowestPrice.unit_price.toFixed(2)}`
        : "Contact for pricing";

  // Determine display image
  // 1. Try to find primary image
  // 2. Fallback to first image in array
  // 3. Fallback to legacy image_url column
  const displayImage = 
    product.product_images?.find(img => img.is_primary)?.image_url || 
    product.product_images?.[0]?.image_url || 
    product.image_url;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
      {/* Product Image */}
      <div
        className="relative h-48 bg-muted overflow-hidden"
        onClick={() => onViewDetails(product)}
      >
        {displayImage ? (
          <Image
            src={displayImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-muted-foreground" />
          </div>
        )}

        {/* Category Badge */}
        {product.category && (
          <Badge className="absolute top-3 left-3" variant="secondary">
            {product.category}
          </Badge>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        <div onClick={() => onViewDetails(product)}>
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {product.description}
            </p>
          )}
        </div>

        {/* Price Range */}
        <div className="flex items-baseline gap-2">
          <TrendingDown className="w-4 h-4 text-green-600" />
          <span className="text-lg font-bold text-primary">{priceRange}</span>
          {product.product_pricing && product.product_pricing.length > 1 && (
            <span className="text-xs text-muted-foreground">
              ({product.product_pricing.length} tiers)
            </span>
          )}
        </div>

        {/* MOQ and Lead Time */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          {product.moq && (
            <div className="flex items-center gap-1">
              <Package className="w-3.5 h-3.5" />
              <span>MOQ: {product.moq.toLocaleString()}</span>
            </div>
          )}
          {product.lead_time_days && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{product.lead_time_days} days</span>
            </div>
          )}
        </div>

        {/* SKU */}
        {product.sku && (
          <div className="text-xs text-muted-foreground">
            SKU: {product.sku}
          </div>
        )}

        {/* View Details Button */}
        <Button
          className="w-full"
          variant="outline"
          onClick={() => onViewDetails(product)}
        >
          View Details
        </Button>
      </div>
    </Card>
  );
}
