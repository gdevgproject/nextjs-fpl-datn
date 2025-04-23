"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useOrderItems(orderId: number | null) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ["order_items", "list", orderId],
    queryFn: async () => {
      if (!orderId) return { data: [], count: 0 };

      const { data, error, count } = await supabase
        .from("order_items")
        .select(
          `
          id, 
          order_id, 
          variant_id, 
          product_name, 
          variant_volume_ml, 
          quantity, 
          unit_price_at_order,
          product_variants(id, product_id, sku, products(id, slug))
        `
        )
        .eq("order_id", orderId);

      if (error) {
        console.error("Error fetching order items:", error);
        throw error;
      }

      return { data: data || [], count };
    },
    enabled: !!orderId,
  });
}
