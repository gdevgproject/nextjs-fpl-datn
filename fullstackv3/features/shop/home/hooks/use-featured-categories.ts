"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProductData } from "./use-new-arrivals";

interface ProductVariantResponse {
  id: number;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  volume_ml: number;
  products: {
    id: number;
    name: string;
    slug: string;
    brands: {
      id: number;
      name: string;
    };
    product_images: {
      image_url: string;
      is_main: boolean;
    }[];
    product_categories: {
      category_id: number;
    }[];
  };
}

export const useFeaturedCategoryProducts = (categoryId: number | null) => {
  return useQuery<{ data: ProductData[] }>({
    queryKey: ["products", "category", categoryId],
    queryFn: async () => {
      if (!categoryId) return { data: [] };

      const supabase = getSupabaseBrowserClient();
      const query = supabase
        .from("product_variants")
        .select(
          `
          id, 
          price, 
          sale_price,
          stock_quantity,
          volume_ml,
          products!inner(
            id,
            name, 
            slug, 
            deleted_at,
            brands(id, name),
            product_images(
              image_url,
              is_main
            ),
            product_categories!inner(
              category_id
            )
          )
        `
        )
        .eq("products.product_categories.category_id", categoryId)
        .is("products.deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(8);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching products:", error);
        throw new Error(error.message);
      }

      // Transform the data for ProductCard component
      const products: ProductData[] = [];
      const processedProductIds = new Set<number>();

      for (const variant of (data as ProductVariantResponse[]) || []) {
        const productId = variant.products.id;

        // Skip if we've already processed this product
        if (processedProductIds.has(productId)) {
          // Find the product and add the variant
          const existingProduct = products.find((p) => p.id === productId);
          if (existingProduct && existingProduct.variants) {
            existingProduct.variants.push({
              id: variant.id,
              volume_ml: variant.volume_ml,
              price: variant.price,
              sale_price: variant.sale_price,
              stock_quantity: variant.stock_quantity,
            });
          }
          continue;
        }

        // Mark this product as processed
        processedProductIds.add(productId);

        // Create product entry
        products.push({
          id: productId,
          name: variant.products.name,
          slug: variant.products.slug,
          brand: {
            id: variant.products.brands?.id,
            name: variant.products.brands?.name,
          },
          images:
            variant.products.product_images?.map((img) => ({
              image_url: img.image_url,
              is_main: img.is_main,
            })) || [],
          price: variant.price,
          sale_price: variant.sale_price,
          variants: [
            {
              id: variant.id,
              volume_ml: variant.volume_ml,
              price: variant.price,
              sale_price: variant.sale_price,
              stock_quantity: variant.stock_quantity,
            },
          ],
        });
      }

      return { data: products };
    },
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
