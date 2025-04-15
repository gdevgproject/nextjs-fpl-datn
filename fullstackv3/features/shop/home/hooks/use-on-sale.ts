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
  // Thông tin của biến thể được CHỌN (giảm giá cao nhất)
  chosen_variant_id: number;
  chosen_volume_ml: number;
  chosen_price: number; // Giá gốc của biến thể được chọn
  chosen_sale_price: number; // Giá sale của biến thể được chọn
  chosen_discount_amount: number; // Mức giảm giá tuyệt đối của biến thể được chọn
  is_chosen_variant_in_stock: boolean; // Biến thể được chọn có còn hàng không?
  // Thông tin chung của sản phẩm
  is_generally_in_stock: boolean; // Sản phẩm này có bất kỳ biến thể nào còn hàng không?
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
          // Tạo variant dựa trên chosen_variant_id từ SQL function
          const variants = [
            {
              id: item.chosen_variant_id,
              volume_ml: item.chosen_volume_ml,
              price: item.chosen_price,
              sale_price: item.chosen_sale_price,
              stock_quantity: item.is_chosen_variant_in_stock ? 1 : 0,
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
            // Sử dụng thông tin của biến thể được chọn cho hiển thị giá
            price: item.chosen_price,
            sale_price: item.chosen_sale_price,
            variants,
          };
        }
      );

      return products;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
