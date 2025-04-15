"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import ProductSectionSkeleton from "./product-section-skeleton";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/shared/product-card";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function BestSellersSection() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["products", "best-sellers"],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.rpc("get_best_selling_products", {
        p_limit: 8,
      });

      if (error) {
        console.error("Error fetching best sellers:", error);
        throw new Error(error.message);
      }

      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Handle loading state
  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Sản phẩm bán chạy
          </h2>
          <Link
            href="/san-pham?sortBy=popular"
            className="text-sm font-medium hover:underline self-end sm:self-auto"
          >
            Xem tất cả
          </Link>
        </div>
        <ProductSectionSkeleton />
      </section>
    );
  }

  // Handle error state
  if (error || !data) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Sản phẩm bán chạy
        </h2>
        <div className="p-8 text-center rounded-lg bg-muted/30">
          <p className="text-muted-foreground mb-4">
            Không thể tải sản phẩm bán chạy
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </div>
      </section>
    );
  }

  // If no products found
  if (data.length === 0) {
    return null;
  }

  // Transform data for ProductCard
  const products = data.map((item: any, index: number) => ({
    uniqueKey: `best-seller-${item.product_id}-${index}`,
    product: {
      id: item.product_id,
      slug: item.product_slug,
      name: item.product_name,
      brand: {
        id: item.brand_id,
        name: item.brand_name,
      },
      images: [
        {
          image_url: item.image_url || "/placeholder.svg",
          is_main: true,
        },
      ],
      price: item.price || 0,
      sale_price: item.sale_price,
      // Thêm ước lượng stock_quantity để tránh hiện "hết hàng"
      variants:
        item.stock_quantity && item.stock_quantity > 0
          ? [
              {
                id: item.variant_id || 0,
                price: item.price || 0,
                sale_price: item.sale_price,
                stock_quantity: item.stock_quantity,
              },
            ]
          : [],
    },
  }));

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Sản phẩm bán chạy
        </h2>
        <Link
          href="/san-pham?sortBy=popular"
          className="text-sm font-medium hover:underline self-end sm:self-auto"
        >
          Xem tất cả
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {products.map((item) => (
          <ProductCard key={item.uniqueKey} product={item.product} />
        ))}
      </div>
    </section>
  );
}
