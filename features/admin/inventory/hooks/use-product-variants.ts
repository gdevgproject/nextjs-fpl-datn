"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface ProductVariantsFilters {
  search?: string;
  productId?: number;
}

export function useProductVariants(filters?: ProductVariantsFilters) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ["product_variants", "list", filters],
    queryFn: async () => {
      // Start with base query
      let query = supabase
        .from("product_variants")
        .select(
          `
          id, 
          product_id, 
          volume_ml, 
          price, 
          sale_price, 
          sku, 
          stock_quantity,
          products(id, name, slug, brand_id, brands(id, name))
        `
        )
        .is("deleted_at", null); // Only non-deleted variants

      // Apply search filter to product name or SKU
      if (filters?.search) {
        query = query.or(
          `products.name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`
        );
      }

      // Filter by product ID
      if (filters?.productId) {
        query = query.eq("product_id", filters.productId);
      }

      // Sort by product name and volume
      query = query
        .order("name", {
          ascending: true,
          foreignTable: "products",
        })
        .order("volume_ml", { ascending: true });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    },
  });
}
