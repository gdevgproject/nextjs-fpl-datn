"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

const supabase = getSupabaseBrowserClient();

interface ProductsFilters {
  search?: string;
  brandId?: number;
  genderId?: number;
  perfumeTypeId?: number;
  concentrationId?: number;
  categoryId?: number;
  includeDeleted?: boolean;
}

interface ProductsPagination {
  page: number;
  pageSize: number;
}

interface ProductsSort {
  column: string;
  direction: "asc" | "desc";
}

export function useProducts(
  filters?: ProductsFilters,
  pagination?: ProductsPagination,
  sort?: ProductsSort
) {
  return useQuery({
    queryKey: ["products", "list", filters, pagination, sort],
    queryFn: async () => {
      try {
        // Start building the query
        let query = supabase.from("products").select(
          `
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
          { count: "exact" }
        );

        // Apply search filter
        if (filters?.search) {
          query = query.ilike("name", `%${filters.search}%`);
        }

        // Apply brand filter
        if (filters?.brandId) {
          query = query.eq("brand_id", filters.brandId);
        }

        // Apply gender filter
        if (filters?.genderId) {
          query = query.eq("gender_id", filters.genderId);
        }

        // Apply perfume type filter
        if (filters?.perfumeTypeId) {
          query = query.eq("perfume_type_id", filters.perfumeTypeId);
        }

        // Apply concentration filter
        if (filters?.concentrationId) {
          query = query.eq("concentration_id", filters.concentrationId);
        }

        // Apply category filter (requires a join)
        if (filters?.categoryId) {
          query = query.eq(
            "product_categories.category_id",
            filters.categoryId
          );
        }

        // By default, exclude deleted products
        if (!filters?.includeDeleted) {
          query = query.is("deleted_at", null);
        }

        // Apply sorting
        const sortColumn = sort?.column || "name";
        const sortOrder = sort?.direction === "desc" ? false : true;
        query = query.order(sortColumn, { ascending: sortOrder });

        // Apply pagination if provided
        if (pagination) {
          const { page, pageSize } = pagination;
          const from = (page - 1) * pageSize;
          const to = from + pageSize - 1;
          query = query.range(from, to);
        }

        // Execute the query
        const { data, error, count } = await query;

        if (error) {
          throw error;
        }

        return { data, count };
      } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
