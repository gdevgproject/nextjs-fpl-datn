"use client";

import Link from "next/link";
import ProductSectionSkeleton from "./product-section-skeleton";
import { Button } from "@/components/ui/button";
import ProductCard from "@/features/shop/shared/components/product-card";
import { useOnSaleProducts } from "../hooks/use-on-sale";
import type { ProductData } from "../hooks/use-new-arrivals";

export default function OnSaleSection({
  initialData,
}: {
  initialData?: ProductData[];
}) {
  let products = initialData;
  let isLoading = false;
  let error: unknown = null;
  if (!initialData) {
    const query = useOnSaleProducts();
    products = query.data;
    isLoading = query.isLoading;
    error = query.error;
  }

  // Loading state
  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">
            Đang Giảm Giá
          </h2>
          <Link
            href="/san-pham?onSale=true"
            className="px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-sm"
          >
            Xem tất cả
          </Link>
        </div>
        <ProductSectionSkeleton />
      </section>
    );
  }

  // Handle error state
  if (error || !products) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Đang giảm giá
        </h2>
        <div className="p-8 text-center rounded-lg bg-muted/30">
          <p className="text-muted-foreground mb-4">
            Không thể tải sản phẩm giảm giá
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </div>
      </section>
    );
  }

  // If no products found
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">
          Đang Giảm Giá
        </h2>
        <Link
          href="/san-pham?onSale=true"
          className="px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-sm"
        >
          Xem tất cả
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard
            key={`sale-${product.id}-${product.variants?.[0]?.id || "default"}`}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}
