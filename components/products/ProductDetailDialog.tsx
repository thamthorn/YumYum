"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Clock,
  Tag,
  FileText,
  MessageSquare,
  ShoppingCart,
} from "lucide-react";
import PriceCalculator from "./PriceCalculator";
import PricingTiersTable from "./PricingTiersTable";
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

interface ProductDetailDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  oemSlug?: string;
}

export default function ProductDetailDialog({
  product,
  open,
  onOpenChange,
  oemSlug,
}: ProductDetailDialogProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) return null;

  // Combine main image with product images
  const allImages = [
    ...(product.image_url
      ? [
          {
            image_url: product.image_url,
            alt_text: product.name,
            is_primary: true,
          },
        ]
      : []),
    ...(product.product_images || []),
  ];

  const specifications = product.specifications as Record<
    string,
    string
  > | null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl! max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{product.name}</DialogTitle>
              <div className="mt-2">
                {product.category && (
                  <Badge variant="secondary" className="mr-2">
                    {product.category}
                  </Badge>
                )}
                {product.sku && (
                  <span className="text-sm text-muted-foreground">
                    SKU: {product.sku}
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid md:grid-cols-[1fr_2fr] gap-6 mt-4">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden max-w-md">
              {allImages[selectedImage] ? (
                <Image
                  src={allImages[selectedImage].image_url}
                  alt={allImages[selectedImage].alt_text || product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-20 h-20 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent hover:border-primary/50"
                    }`}
                  >
                    <Image
                      src={img.image_url}
                      alt={img.alt_text || `${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              {product.moq && (
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">MOQ</div>
                    <div className="font-semibold">
                      {product.moq.toLocaleString()} units
                    </div>
                  </div>
                </div>
              )}
              {product.lead_time_days && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Lead Time
                    </div>
                    <div className="font-semibold">
                      {product.lead_time_days} days
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            <Tabs defaultValue="pricing" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="specs">Specs</TabsTrigger>
              </TabsList>

              <TabsContent value="pricing" className="space-y-4 mt-4">
                {product.product_pricing &&
                product.product_pricing.length > 0 ? (
                  <>
                    <PricingTiersTable pricingTiers={product.product_pricing} />
                    <Separator />
                    <PriceCalculator
                      pricingTiers={product.product_pricing}
                      moq={product.moq}
                    />
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Contact seller for pricing information</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="details" className="space-y-4 mt-4">
                {product.description ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {product.description}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No description available</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="specs" className="space-y-4 mt-4">
                {specifications && Object.keys(specifications).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(specifications).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between py-2 border-b last:border-0"
                      >
                        <span className="text-sm font-medium capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No specifications available</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="outline" asChild>
            <a
              href={`/request/quote?product=${product.id}${oemSlug ? `&oem=${oemSlug}` : ""}`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Request Quote
            </a>
          </Button>
          <Button asChild>
            <a
              href={`/request/quote?product=${product.id}${oemSlug ? `&oem=${oemSlug}` : ""}`}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Order Now
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
