"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface InventoryFilters {
  search?: string;
  variantId?: number;
  reason?: string;
  startDate?: string;
  endDate?: string;
  minChange?: number;
  maxChange?: number;
}

interface InventoryPagination {
  page: number;
  pageSize: number;
}

interface InventorySort {
  column: string;
  direction: "asc" | "desc";
}

export function useInventory(
  filters?: InventoryFilters,
  pagination?: InventoryPagination,
  sort?: InventorySort
) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ["inventory", "list", filters, pagination, sort],
    queryFn: async () => {
      // Start with base query
      let query = supabase.from("inventory").select(
        `
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
        {
          count: "exact",
        }
      );

      // Apply search filter to product name via join
      if (filters?.search) {
        query = query.or(
          `product_variants.products.name.ilike.%${filters.search}%,product_variants.sku.ilike.%${filters.search}%`
        );
      }

      // Filter by variant ID
      if (filters?.variantId) {
        query = query.eq("variant_id", filters.variantId);
      }

      // Filter by reason (partial match)
      if (filters?.reason) {
        query = query.ilike("reason", `%${filters.reason}%`);
      }

      // Filter by date range
      if (filters?.startDate) {
        query = query.gte("timestamp", filters.startDate);
      }
      if (filters?.endDate) {
        // Add one day to include the end date fully
        const endDate = new Date(filters.endDate);
        endDate.setDate(endDate.getDate() + 1);
        query = query.lt("timestamp", endDate.toISOString());
      }

      // Filter by change amount range
      if (filters?.minChange !== undefined) {
        query = query.gte("change_amount", filters.minChange);
      }
      if (filters?.maxChange !== undefined) {
        query = query.lte("change_amount", filters.maxChange);
      }

      // Apply sorting
      if (sort) {
        const sortColumn =
          sort.column === "product_variants.products.name"
            ? "product_variants(products(name))"
            : sort.column;
        query = query.order(sortColumn, {
          ascending: sort.direction === "asc",
        });
      } else {
        // Default sort by timestamp descending
        query = query.order("timestamp", { ascending: false });
      }

      // Apply pagination
      if (pagination) {
        const { page, pageSize } = pagination;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        data,
        count,
      };
    },
  });
}
