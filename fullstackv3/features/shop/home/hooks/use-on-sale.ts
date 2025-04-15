"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProductData } from "./use-new-arrivals";

interface OnSaleData {
  product_id: number;
  product_name: string;
  product_slug: string;
  brand_name: string;
  main_image_url: string;
  display_price: number;
  original_price_high: number;
  is_generally_in_stock: boolean;
  variant_id?: number;
}

export const useOnSaleProducts = () => {
  return useQuery<ProductData[]>({
    queryKey: ["products", "on-sale"],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.rpc(
        "get_homepage_on_sale_products_with_stock",
        { p_limit: 8 }
      );

      if (error) {
        console.error("Error fetching on sale products:", error);
        throw new Error(error.message);
      }

      // Transform data for ProductCard
      const products: ProductData[] = ((data as OnSaleData[]) || []).map(
        (item: OnSaleData) => {
          const variants = [
            {
              id: item.variant_id || 0,
              price: item.original_price_high,
              sale_price: item.display_price,
              stock_quantity: item.is_generally_in_stock ? 1 : 0,
            },
          ];

          return {
            id: item.product_id,
            name: item.product_name,
            slug: item.product_slug,
            brand: {
              name: item.brand_name,
            },
            images: [
              {
                image_url: item.main_image_url || "/placeholder.svg",
                is_main: true,
              },
            ],
            price: item.original_price_high,
            sale_price: item.display_price,
            variants,
          };
        }
      );

      return products;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
