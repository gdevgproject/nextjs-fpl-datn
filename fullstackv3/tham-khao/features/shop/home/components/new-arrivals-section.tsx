"use client";

import { useClientFetch } from "@/shared/hooks/use-client-fetch";
import Link from "next/link";
import ProductSectionSkeleton from "./product-section-skeleton";
import { Button } from "@/components/ui/button";
import ProductCard from "@/features/shop/shared/components/product-card";

export default function NewArrivalsSection() {
  const { data, isLoading, error } = useClientFetch(
    ["products", "new-arrivals"],
    "products",
    {
      columns: `
 id, 
 name, 
 slug, 
 brands!inner(name),
 genders(name),
 concentrations(name),
 perfume_types(name),
 product_variants!inner(
   id, 
   price, 
   sale_price,
   stock_quantity
 ),
 product_images(
   image_url,
   is_main
 )
`,
      filters: (query) => {
        // Sử dụng is thay vì eq để xử lý giá trị null đúng cách
        return query
          .is("deleted_at", null)
          .order("created_at", { ascending: false });
      },
      pagination: { page: 1, pageSize: 8 },
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

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

  // Transform data for ProductCard
  const products = (data.data as any[]).map((product) => {
    const variant = product.product_variants[0];
    const discountPercentage =
      variant.sale_price && variant.price
        ? Math.round(
            ((variant.price - variant.sale_price) / variant.price) * 100
          )
        : 0;

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand_name: product.brands?.name,
      gender_name: product.genders?.[0]?.name,
      concentration_name: product.concentrations?.[0]?.name,
      perfume_type_name: product.perfume_types?.[0]?.name,
      image_url:
        product.product_images?.find((img: any) => img.is_main)?.image_url ||
        product.product_images?.[0]?.image_url,
      price: variant.price || 0,
      sale_price: variant.sale_price,
      variant_id: variant.id,
      stock_quantity: variant.stock_quantity || 0,
      discount_percentage: discountPercentage,
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
        {products.map((product) => (
          <ProductCard
            key={`${product.id}-${product.variant_id}`}
            {...product}
          />
        ))}
      </div>
    </section>
  );
}
