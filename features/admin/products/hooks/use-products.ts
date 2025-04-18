"use client"

import { useClientFetch } from "@/shared/hooks/use-client-fetch"

interface ProductsFilters {
  search?: string
  brandId?: number
  genderId?: number
  perfumeTypeId?: number
  concentrationId?: number
  categoryId?: number
  includeDeleted?: boolean
}

interface ProductsPagination {
  page: number
  pageSize: number
}

interface ProductsSort {
  column: string
  direction: "asc" | "desc"
}

export function useProducts(filters?: ProductsFilters, pagination?: ProductsPagination, sort?: ProductsSort) {
  return useClientFetch(
    ["products", "list", filters, pagination, sort],
    "products",
    {
      columns: `
        id, 
        name, 
        slug, 
        product_code, 
        short_description, 
        brand_id, 
        gender_id, 
        perfume_type_id, 
        concentration_id, 
        deleted_at,
        brands:brand_id (id, name),
        genders:gender_id (id, name),
        perfume_types:perfume_type_id (id, name),
        concentrations:concentration_id (id, name)
      `,
      filters: (query) => {
        let q = query

        // Apply search filter
        if (filters?.search) {
          q = q.ilike("name", `%${filters.search}%`)
        }

        // Apply brand filter
        if (filters?.brandId) {
          q = q.eq("brand_id", filters.brandId)
        }

        // Apply gender filter
        if (filters?.genderId) {
          q = q.eq("gender_id", filters.genderId)
        }

        // Apply perfume type filter
        if (filters?.perfumeTypeId) {
          q = q.eq("perfume_type_id", filters.perfumeTypeId)
        }

        // Apply concentration filter
        if (filters?.concentrationId) {
          q = q.eq("concentration_id", filters.concentrationId)
        }

        // Apply category filter (requires a join)
        if (filters?.categoryId) {
          q = q.eq("product_categories.category_id", filters.categoryId)
        }

        // By default, exclude deleted products
        if (!filters?.includeDeleted) {
          q = q.is("deleted_at", null)
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
              column: sort.column,
              ascending: sort.direction === "asc",
            },
          ]
        : [{ column: "name", ascending: true }],
      // Enable exact count for pagination
      count: "exact",
    },
    {
      // Keep data fresh but don't refetch too often
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  )
}
