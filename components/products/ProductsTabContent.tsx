"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Package } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import ProductDetailDialog from "@/components/products/ProductDetailDialog";
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

interface ProductsTabContentProps {
  oemOrgId: string;
  oemSlug: string;
}

export default function ProductsTabContent({
  oemOrgId,
  oemSlug,
}: ProductsTabContentProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["oem-products", oemOrgId],
    queryFn: async () => {
      const response = await fetch(`/api/products?oem_org_id=${oemOrgId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const body = await response.json();
      return body.data || [];
    },
  });

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card className="p-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="p-12 text-center text-muted-foreground">
        <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <h3 className="font-semibold text-lg mb-2">No Products Available</h3>
        <p className="text-sm">
          This manufacturer hasn&apos;t listed any products yet.
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      <ProductDetailDialog
        product={selectedProduct}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        oemSlug={oemSlug}
      />
    </>
  );
}
