"use client"

import { useClientRpcQuery } from "@/shared/hooks/use-client-rpc"
import Link from "next/link"
import ProductSectionSkeleton from "./product-section-skeleton"
import { Button } from "@/components/ui/button"
import ProductCard from "@/features/shop/shared/components/product-card"

export default function BestSellersSection() {
  const { data, isLoading, error } = useClientRpcQuery(
    "get_best_selling_products",
    { p_limit: 8 },
    {
      staleTime: 1000 * 60 * 10, // 10 minutes
    },
  )

  // Handle loading state
  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Sản phẩm bán chạy</h2>
          <Link href="/san-pham?sortBy=popular" className="text-sm font-medium hover:underline self-end sm:self-auto">
            Xem tất cả
          </Link>
        </div>
        <ProductSectionSkeleton />
      </section>
    )
  }

  // Handle error state
  if (error || !data) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Sản phẩm bán chạy</h2>
        <div className="p-8 text-center rounded-lg bg-muted/30">
          <p className="text-muted-foreground mb-4">Không thể tải sản phẩm bán chạy</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </div>
      </section>
    )
  }

  // If no products found
  if (data.length === 0) {
    return null
  }

  // Transform data for ProductCard
  const products = data.map((product: any) => ({
    id: product.product_id,
    slug: product.product_slug,
    name: product.product_name,
    brand_name: product.brand_name,
    gender_name: product.gender_name,
    concentration_name: product.concentration_name,
    perfume_type_name: product.perfume_type_name,
    image_url: product.image_url,
    price: product.price || 0,
    sale_price: product.sale_price,
    // Note: We don't have variant_id in the RPC result, so Add to Cart won't work
    // This is intentional - users need to click through to the product page
    showAddToCart: false, // Disable add to cart button for best sellers since we don't have variant info
  }))

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Sản phẩm bán chạy</h2>
        <Link href="/san-pham?sortBy=popular" className="text-sm font-medium hover:underline self-end sm:self-auto">
          Xem tất cả
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  )
}
