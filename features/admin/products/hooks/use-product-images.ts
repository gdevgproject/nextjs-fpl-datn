"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductImage } from "../types";
import { createProductImageAction, deleteProductImageAction } from "../actions";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

const supabase = getSupabaseBrowserClient();

/**
 * Hook to fetch images for a specific product
 */
export function useProductImages(productId: number | null) {
  return useQuery<{ data: ProductImage[]; count: number | null }, Error>({
    queryKey: ["product_images", "by_product", productId],
    queryFn: async () => {
      let query = supabase
        .from("product_images")
        .select(
          "id, product_id, image_url, alt_text, is_main, display_order, created_at, updated_at"
        );

      if (productId) {
        query = query.eq("product_id", productId);
      }

      // Apply sorting for optimal display order
      query = query
        .order("is_main", { ascending: false }) // Main image first
        .order("display_order", { ascending: true }); // Then by display order

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching product images:", error);
        throw new Error(error.message || "Failed to fetch product images");
      }

      return { data: data as ProductImage[], count };
    },
    enabled: !!productId, // Only fetch if productId is provided
  });
}

/**
 * Hook to create a new product image using server actions
 */
export function useCreateProductImage() {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

  return useMutation({
    mutationFn: async (payload: {
      productId: number;
      imageUrl: string;
      isMain?: boolean;
      altText?: string;
      displayOrder?: number;
    }) => {
      const {
        productId,
        imageUrl,
        isMain = false,
        altText = "",
        displayOrder = 0,
      } = payload;

      // Add validation to ensure productId is not null
      if (!productId) {
        throw new Error("Product ID is required to create an image");
      }

      const result = await createProductImageAction(
        productId,
        imageUrl,
        isMain,
        altText,
        displayOrder
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to create product image");
      }

      return result.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["product_images", "by_product", variables.productId],
      });

      toast.success("Success", {
        description: "Product image added successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating product image:", error);

      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to add product image",
      });
    },
  });
}

/**
 * Hook to update existing product image
 */
export function useUpdateProductImage() {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

  return useMutation({
    mutationFn: async (payload: {
      id: number;
      productId: number;
      isMain?: boolean;
      altText?: string;
      displayOrder?: number;
    }) => {
      const { id, productId, isMain, altText, displayOrder, ...otherProps } =
        payload;

      // Convert camelCase to snake_case for Supabase
      const updateData = {
        ...(isMain !== undefined && { is_main: isMain }),
        ...(altText !== undefined && { alt_text: altText }),
        ...(displayOrder !== undefined && { display_order: displayOrder }),
        ...otherProps,
      };

      // For updating image properties, but not the image itself
      const { data, error } = await supabase
        .from("product_images")
        .update(updateData)
        .eq("id", id)
        .select();

      if (error) {
        throw new Error(error.message || "Failed to update product image");
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["product_images", "by_product", variables.productId],
      });

      toast.success("Success", {
        description: "Product image updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating product image:", error);

      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to update product image",
      });
    },
  });
}

/**
 * Hook to delete a product image and remove from storage
 */
export function useDeleteProductImage() {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

  return useMutation({
    mutationFn: async (payload: {
      id: number;
      imageUrl?: string;
      productId: number;
      isMain?: boolean;
    }) => {
      const { id, imageUrl, productId, isMain } = payload;

      // If this is the main image, try to set another image as main before deleting
      if (isMain) {
        try {
          // Get another image from the same product to set as main
          const { data: otherImages } = await supabase
            .from("product_images")
            .select("id")
            .eq("product_id", productId)
            .neq("id", id)
            .limit(1);

          if (otherImages && otherImages.length > 0) {
            // Set the first available image as main
            await supabase
              .from("product_images")
              .update({ is_main: true })
              .eq("id", otherImages[0].id);
          }
        } catch (err) {
          console.error("Error setting new main image:", err);
          // Continue with deletion even if setting a new main image fails
        }
      }

      // Delete the image
      const result = await deleteProductImageAction(id, imageUrl || "");

      if (!result.success) {
        throw new Error(result.error || "Failed to delete product image");
      }

      return { ...result, productId };
    },
    onSuccess: (result, variables) => {
      // Use the productId passed in the payload to invalidate queries
      queryClient.invalidateQueries({
        queryKey: ["product_images", "by_product", variables.productId],
      });

      toast.success("Success", {
        description: "Product image deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Error deleting product image:", error);

      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete product image",
      });
    },
  });
}

/**
 * Hook to set a product image as the main image
 */
export function useSetMainProductImage() {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

  return useMutation({
    mutationFn: async (payload: { id: number; productId: number }) => {
      const { id, productId } = payload;

      // First, unset any existing main images for this product
      const { error: updateError } = await supabase
        .from("product_images")
        .update({ is_main: false })
        .eq("product_id", productId)
        .eq("is_main", true);

      if (updateError) {
        console.error("Error updating existing main image:", updateError);
        throw new Error(updateError.message);
      }

      // Then set the new main image
      const { data, error } = await supabase
        .from("product_images")
        .update({ is_main: true })
        .eq("id", id)
        .select();

      if (error) {
        throw new Error(error.message || "Failed to set main product image");
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["product_images", "by_product", variables.productId],
      });

      toast.success("Success", {
        description: "Main product image updated",
      });
    },
    onError: (error) => {
      console.error("Error setting main product image:", error);

      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to set main product image",
      });
    },
  });
}
