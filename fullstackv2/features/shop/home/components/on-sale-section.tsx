"use client"

import { useClientRpcQuery } from "@/shared/hooks/use-client-rpc"
import Link from "next/link"
import ProductSectionSkeleton from "./product-section-skeleton"
import { Button } from "@/components/ui/button"
import ProductCard from "@/features/shop/shared/components/product-card"

export default function OnSaleSection() {
  const { data, isLoading, error } = useClientRpcQuery(
    "get_homepage_on_sale_products_with_stock",
    { p_limit: 8 },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      queryKey: ["products", "on-sale"],
    },
  )

  // Handle loading state
  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Đang giảm giá</h2>
          <Link href="/san-pham?onSale=true" className="text-sm font-medium hover:underline self-end sm:self-auto">
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
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Đang giảm giá</h2>
        <div className="p-8 text-center rounded-lg bg-muted/30">
          <p className="text-muted-foreground mb-4">Không thể tải sản phẩm giảm giá</p>
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
  const products = data.map((product) => ({
    id: product.product_id,
    slug: product.product_slug,
    name: product.product_name,
    brand_name: product.brand_name,
    image_url: product.main_image_url,
    price: product.original_price_high,
    sale_price: product.display_price,
    // Chuyển is_generally_in_stock thành stock_quantity để ProductCard hiểu được
    stock_quantity: product.is_generally_in_stock ? 1 : 0, // Nếu còn hàng thì đặt stock_quantity > 0
    variant_id: 1,
    discount_percentage: Math.round(
      ((product.original_price_high - product.display_price) / product.original_price_high) * 100,
    ),
  }))

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Đang giảm giá</h2>
        <Link href="/san-pham?onSale=true" className="text-sm font-medium hover:underline self-end sm:self-auto">
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
