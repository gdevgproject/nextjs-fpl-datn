"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProductData } from "./use-new-arrivals";

interface BestSellerData {
  product_id: number;
  product_name: string;
  product_slug: string;
  brand_name: string;
  brand_id?: number;
  image_url: string;
  price?: number;
  sale_price?: number | null;
  stock_quantity?: number;
  variant_id?: number;
  total_sold: number;
}

export const useBestSellers = (initialData?: ProductData[]) => {
  return useQuery<ProductData[]>({
    queryKey: ["products", "best-sellers"],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.rpc("get_best_selling_products", {
        p_limit: 8,
      });

      if (error) {
        console.error("Error fetching best sellers:", error);
        throw new Error(error.message);
      }

      // Transform data for ProductCard
      const products: ProductData[] = ((data as BestSellerData[]) || []).map(
        (item: BestSellerData) => {
          // Tạo variants giả nếu không có để ProductCard không báo hết hàng
          const variants = [
            {
              id: item.variant_id || 0,
              price: item.price || 0,
              sale_price: item.sale_price,
              stock_quantity: item.stock_quantity ?? 1,
            },
          ];

          return {
            id: item.product_id,
            name: item.product_name,
            slug: item.product_slug,
            brand: {
              id: item.brand_id,
              name: item.brand_name,
            },
            images: [
              {
                image_url: item.image_url || "/placeholder.svg",
                is_main: true,
              },
            ],
            price: item.price || 0,
            sale_price: item.sale_price,
            variants,
          };
        }
      );

      return products;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    initialData,
  });
};
