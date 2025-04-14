"use client"

import { useClientFetch } from "@/shared/hooks/use-client-fetch"

interface ProductVariantsFilters {
  search?: string
  productId?: number
}

export function useProductVariants(filters?: ProductVariantsFilters) {
  return useClientFetch(["product_variants", "list", filters], "product_variants", {
    columns: `
     id, 
     product_id, 
     volume_ml, 
     price, 
     sale_price, 
     sku, 
     stock_quantity,
     products(id, name, slug, brand_id, brands(id, name))
   `,
    filters: (query) => {
      let q = query.is("deleted_at", null) // Only non-deleted variants

      // Apply search filter to product name or SKU
      if (filters?.search) {
        q = q.or(`products.name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`)
      }

      // Filter by product ID
      if (filters?.productId) {
        q = q.eq("product_id", filters.productId)
      }

      return q
    },
    // Sort by product name and volume
    sort: [
      { column: "products(name)", ascending: true },
      { column: "volume_ml", ascending: true },
    ],
  })
}
