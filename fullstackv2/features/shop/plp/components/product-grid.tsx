"use client"

import type { Product } from "../hooks/use-products"
import { ProductCard } from "@/features/shop/shared/components/product-card"
import { ProductCardSkeleton } from "./product-card-skeleton"

interface ProductGridProps {
  products: Product[]
  isLoading: boolean
}

export function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          slug={product.slug}
          name={product.name}
          brand_name={product.brand_name || undefined}
          image_url={product.main_image_url || undefined}
          price={product.display_price || 0}
          sale_price={product.is_on_sale ? product.sale_price || 0 : undefined}
          variant_id={product.variant_id || undefined}
          stock_quantity={product.stock_quantity || 0}
          gender_name={product.gender_name}
          concentration_name={product.concentration_name}
          perfume_type_name={product.perfume_type_name}
          discount_percentage={product.discount_percentage || undefined}
        />
      ))}
    </div>
  )
}
