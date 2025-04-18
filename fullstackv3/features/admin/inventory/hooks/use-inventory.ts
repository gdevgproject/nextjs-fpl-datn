"use client"

import { useClientFetch } from "@/shared/hooks/use-client-fetch"

interface InventoryFilters {
  search?: string
  variantId?: number
  reason?: string
  startDate?: string
  endDate?: string
  minChange?: number
  maxChange?: number
}

interface InventoryPagination {
  page: number
  pageSize: number
}

interface InventorySort {
  column: string
  direction: "asc" | "desc"
}

export function useInventory(filters?: InventoryFilters, pagination?: InventoryPagination, sort?: InventorySort) {
  return useClientFetch(["inventory", "list", filters, pagination, sort], "inventory", {
    columns: `
      id, 
      variant_id, 
      change_amount, 
      reason, 
      order_id, 
      stock_after_change, 
      updated_by, 
      timestamp,
      product_variants(id, volume_ml, sku, product_id, products(id, name, slug))
    `,
    filters: (query) => {
      let q = query

      // Apply search filter to product name via join
      if (filters?.search) {
        q = q.or(
          `product_variants.products.name.ilike.%${filters.search}%,product_variants.sku.ilike.%${filters.search}%`,
        )
      }

      // Filter by variant ID
      if (filters?.variantId) {
        q = q.eq("variant_id", filters.variantId)
      }

      // Filter by reason (partial match)
      if (filters?.reason) {
        q = q.ilike("reason", `%${filters.reason}%`)
      }

      // Filter by date range
      if (filters?.startDate) {
        q = q.gte("timestamp", filters.startDate)
      }
      if (filters?.endDate) {
        // Add one day to include the end date fully
        const endDate = new Date(filters.endDate)
        endDate.setDate(endDate.getDate() + 1)
        q = q.lt("timestamp", endDate.toISOString())
      }

      // Filter by change amount range
      if (filters?.minChange !== undefined) {
        q = q.gte("change_amount", filters.minChange)
      }
      if (filters?.maxChange !== undefined) {
        q = q.lte("change_amount", filters.maxChange)
      }

      return q
    },
    // Apply pagination
    pagination: pagination
      ? {
          page: pagination.page,
          pageSize: pagination.pageSize,
        }
      : undefined,
    // Apply sorting
    sort: sort
      ? [
          {
            column: sort.column === "product_variants.products.name" ? "product_variants(products(name))" : sort.column,
            ascending: sort.direction === "asc",
          },
        ]
      : [{ column: "timestamp", ascending: false }], // Default sort by timestamp descending
    // Enable exact count for pagination
    count: "exact",
  })
}
