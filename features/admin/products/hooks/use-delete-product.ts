"use client";

import { useClientMutation } from "@/shared/hooks/use-client-mutation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useDeleteProductImages } from "./use-delete-product-images";

const supabase = getSupabaseBrowserClient();

export function useDeleteProduct() {
  const deleteProductMutation = useClientMutation("products", "update", {
    invalidateQueries: [["products", "list"]],
    primaryKey: "id",
  });

  const deleteImagesMutation = useDeleteProductImages();

  // Extend the mutation to handle soft delete and image cleanup
  return {
    ...deleteProductMutation,
    softDelete: async (productId: number) => {
      try {
        // Soft delete by setting deleted_at timestamp
        return await deleteProductMutation.mutateAsync({
          id: productId,
          deleted_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error soft deleting product:", error);
        throw error;
      }
    },
    restore: async (productId: number) => {
      try {
        // Restore by clearing deleted_at
        return await deleteProductMutation.mutateAsync({
          id: productId,
          deleted_at: null,
        });
      } catch (error) {
        console.error("Error restoring product:", error);
        throw error;
      }
    },
    hardDelete: async (productId: number) => {
      try {
        // First, get all product images to delete from storage
        const { data: images, error: fetchError } = await supabase
          .from("product_images")
          .select("image_url")
          .eq("product_id", productId);

        if (fetchError) {
          console.error(
            "Error fetching product images before delete:",
            fetchError
          );
        }

        // Hard delete the product (this will cascade to variants, images, etc. due to DB constraints)
        const { error: deleteError } = await supabase
          .from("products")
          .delete()
          .eq("id", productId);

        if (deleteError) {
          throw deleteError;
        }

        // Delete images from storage if any were found
        if (images && images.length > 0) {
          try {
            for (const image of images) {
              if (image.image_url) {
                await deleteImagesMutation.deleteFromUrl(image.image_url);
              }
            }
          } catch (error) {
            console.error("Error deleting product images from storage:", error);
            // We don't throw here because the product was already deleted
          }
        }

        return { success: true, id: productId };
      } catch (error) {
        console.error("Error hard deleting product:", error);
        throw error;
      }
    },
  };
}
