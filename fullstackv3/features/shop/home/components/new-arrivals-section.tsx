"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import ProductSectionSkeleton from "./product-section-skeleton";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/shared/product-card";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function NewArrivalsSection() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["products", "new-arrivals"],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          id, 
          name, 
          slug, 
          brands!inner(id, name),
          product_variants(
            id, 
            price, 
            sale_price,
            stock_quantity,
            volume_ml
          ),
          product_images(
            image_url,
            is_main
          )
        `
        )
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) {
        console.error("Error fetching new arrivals:", error);
        throw new Error(error.message);
      }

      return { data };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Handle loading state
  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Sản phẩm mới
          </h2>
          <Link
            href="/san-pham?sortBy=newest"
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
  if (error || !data?.data) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Sản phẩm mới
        </h2>
        <div className="p-8 text-center rounded-lg bg-muted/30">
          <p className="text-muted-foreground mb-4">
            Không thể tải sản phẩm mới
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </div>
      </section>
    );
  }

  // If no products found
  if (data.data.length === 0) {
    return null;
  }

  // Transform data for ProductCard with unique keys
  const products = (data.data as any[]).map((product) => {
    const mainImage =
      product.product_images?.find((img: any) => img.is_main) ||
      product.product_images?.[0];
    // Sort variants by price to show cheapest first
    const sortedVariants = product.product_variants?.sort((a: any, b: any) => {
      const priceA = a.sale_price || a.price;
      const priceB = b.sale_price || b.price;
      return priceA - priceB;
    });

    // Take the lowest priced variant as the display price
    const firstVariant = sortedVariants?.[0];

    return {
      uniqueKey: `new-${product.id}-${firstVariant?.id || "default"}`,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        brand: {
          id: product.brands?.id,
          name: product.brands?.name,
        },
        images: product.product_images?.map((img: any) => ({
          image_url: img.image_url,
          is_main: img.is_main,
        })),
        price: firstVariant?.price || 0,
        sale_price: firstVariant?.sale_price,
        variants: product.product_variants?.map((variant: any) => ({
          id: variant.id,
          volume_ml: variant.volume_ml,
          price: variant.price,
          sale_price: variant.sale_price,
          stock_quantity: variant.stock_quantity,
        })),
      },
    };
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Sản phẩm mới
        </h2>
        <Link
          href="/san-pham?sortBy=newest"
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
