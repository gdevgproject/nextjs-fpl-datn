"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// Interface cho response từ Supabase
interface ProductApiResponse {
  id: number;
  name: string;
  slug: string;
  brands: {
    id: number;
    name: string;
  };
  product_variants: {
    id: number;
    price: number;
    sale_price: number | null;
    stock_quantity: number;
    volume_ml: number;
  }[];
  product_images: {
    image_url: string;
    is_main: boolean;
  }[];
}

export interface ProductData {
  id: number;
  name: string;
  slug: string;
  brand?: {
    id?: number;
    name: string;
  };
  images?: {
    image_url: string;
    is_main: boolean;
  }[];
  price: number;
  sale_price?: number | null;
  variants?: {
    id: number;
    volume_ml?: number;
    price: number;
    sale_price?: number | null;
    stock_quantity?: number;
  }[];
}

export const useNewArrivals = () => {
  return useQuery<{ data: ProductData[] }>({
    queryKey: ["products", "new-arrivals"],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          id, 
          name, 
          slug, 
          brands!inner(id, name),
          product_variants(
            id, 
            price, 
            sale_price,
            stock_quantity,
            volume_ml
          ),
          product_images(
            image_url,
            is_main
          )
        `
        )
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) {
        console.error("Error fetching new arrivals:", error);
        throw new Error(error.message);
      }

      // Transform data for ProductCard with unique keys
      const products: ProductData[] = (data || []).map(
        (product: ProductApiResponse) => {
          // Sort variants by price to show cheapest first
          const sortedVariants = product.product_variants?.sort((a, b) => {
            const priceA = a.sale_price || a.price;
            const priceB = b.sale_price || b.price;
            return priceA - priceB;
          });

          // Take the lowest priced variant as the display price
          const firstVariant = sortedVariants?.[0];

          return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            brand: {
              id: product.brands?.id,
              name: product.brands?.name,
            },
            images: product.product_images?.map((img) => ({
              image_url: img.image_url,
              is_main: img.is_main,
            })),
            price: firstVariant?.price || 0,
            sale_price: firstVariant?.sale_price,
            variants: product.product_variants?.map((variant) => ({
              id: variant.id,
              volume_ml: variant.volume_ml,
              price: variant.price,
              sale_price: variant.sale_price,
              stock_quantity: variant.stock_quantity,
            })),
          };
        }
      );

      return { data: products };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
