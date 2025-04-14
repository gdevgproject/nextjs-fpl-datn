"use client"

import type { ProductListItem } from "../types/plp-types"
import ProductCard from "@/features/shop/shared/components/product-card"

interface ProductGridProps {
  products: ProductListItem[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          slug={product.slug}
          name={product.name}
          brand_name={product.brand_name || undefined}
          image_url={product.main_image_url || undefined}
          price={product.min_price}
          sale_price={product.min_sale_price || undefined}
          variant_id={undefined} // We don't have variant_id in the list view
          stock_quantity={product.is_in_stock ? 1 : 0} // Use is_in_stock as a proxy
          showAddToCart={false} // Don't show add to cart in list view
          gender_name={product.gender_name || undefined}
          concentration_name={product.concentration_name || undefined}
          perfume_type_name={product.perfume_type_name || undefined}
        />
      ))}
    </div>
  )
}
