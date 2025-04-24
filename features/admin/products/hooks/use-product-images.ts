"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PostgrestError } from "@supabase/supabase-js";

const supabase = getSupabaseBrowserClient();

// Hook to fetch images for a specific product
export function useProductImages(productId: number | null) {
  return useQuery({
    queryKey: ["product_images", "by_product", productId],
    queryFn: async () => {
      let query = supabase
        .from("product_images")
        .select("id, product_id, image_url, alt_text, is_main, display_order");

      if (productId) {
        query = query.eq("product_id", productId);
      }

      // Apply sorting
      query = query
        .order("is_main", { ascending: false }) // Main image first
        .order("display_order", { ascending: true }); // Then by display order

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching product images:", error);
        throw error;
      }

      return { data, count };
    },
    enabled: !!productId, // Only fetch if productId is provided
  });
}

// Hook to create a new product image
export function useCreateProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase
        .from("product_images")
        .insert(payload)
        .select();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate the products list query
      queryClient.invalidateQueries({
        queryKey: ["product_images", "by_product", variables.product_id],
      });
    },
    onError: (error: PostgrestError) => {
      console.error("Error creating product image:", error);
    },
  });
}

// Hook to update an existing product image
export function useUpdateProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: number; [key: string]: any }) => {
      const { id, ...updateData } = payload;

      const { data, error } = await supabase
        .from("product_images")
        .update(updateData)
        .eq("id", id)
        .select();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      if ("product_id" in variables) {
        queryClient.invalidateQueries({
          queryKey: ["product_images", "by_product", variables.product_id],
        });
      } else {
        // If we don't have the product_id in the payload, invalidate more broadly
        queryClient.invalidateQueries({
          queryKey: ["product_images", "by_product"],
        });
      }
    },
    onError: (error: PostgrestError) => {
      console.error("Error updating product image:", error);
    },
  });
}

// Hook to delete a product image
export function useDeleteProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: number }) => {
      try {
        const id = payload.id;

        // First, get the product_id for invalidation
        const { data: imageData, error: fetchError } = await supabase
          .from("product_images")
          .select("product_id")
          .eq("id", id)
          .single();

        if (fetchError) {
          console.error(
            "Error fetching product image before delete:",
            fetchError
          );
          throw fetchError;
        }

        const productId = imageData?.product_id;

        const { error: deleteError } = await supabase
          .from("product_images")
          .delete()
          .eq("id", id);

        if (deleteError) {
          console.error(
            "Error deleting product image from database:",
            deleteError
          );
          throw deleteError;
        }

        return { id, productId };
      } catch (error) {
        console.error("Complete error deleting product image:", error);
        if (error instanceof PostgrestError) {
          throw error;
        } else if (error instanceof Error) {
          throw error;
        } else {
          throw new Error("Unknown error deleting product image");
        }
      }
    },
    onSuccess: (result) => {
      if (result.productId) {
        queryClient.invalidateQueries({
          queryKey: ["product_images", "by_product", result.productId],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: ["product_images", "by_product"],
        });
      }
    },
    onError: (error) => {
      // Đảm bảo không trả về đối tượng lỗi trống
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error deleting product image:", errorMessage);
    },
  });
}
