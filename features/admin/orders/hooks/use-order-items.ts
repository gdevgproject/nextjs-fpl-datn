"use client"

import { useClientFetch } from "@/shared/hooks/use-client-fetch"

export function useOrderItems(orderId: number | null) {
  return useClientFetch(
    ["order_items", "list", orderId],
    "order_items",
    {
      columns: `
        id, 
        order_id, 
        variant_id, 
        product_name, 
        variant_volume_ml, 
        quantity, 
        unit_price_at_order,
        product_variants(id, product_id, sku, products(id, slug))
      `,
      filters: (query) => {
        return query.eq("order_id", orderId || 0)
      },
    },
    {
      enabled: !!orderId,
    },
  )
}
