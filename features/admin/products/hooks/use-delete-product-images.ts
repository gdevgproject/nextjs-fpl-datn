"use client";

import { useStorageDelete } from "@/shared/hooks/use-client-storage";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const supabase = getSupabaseBrowserClient();

export function useDeleteProductImages() {
  const deleteStorageMutation = useStorageDelete("products", {
    invalidateQueryKeys: [["product_images", "by_product"]],
  });

  // Extend mutation to handle URL-based deletion
  return {
    ...deleteStorageMutation,
    // Add method to delete file from URL
    deleteFromUrl: async (url: string): Promise<boolean> => {
      try {
        if (!url) return false;

        // Extract path from URL
        // URL format: https://xxx.supabase.co/storage/v1/object/public/products/123/image.jpg
        const urlParts = url.split("/products/");
        if (urlParts.length <= 1) return false;

        const path = urlParts[1];
        if (!path) return false;

        // Delete file
        const { error } = await supabase.storage
          .from("products")
          .remove([path]);

        if (error) {
          console.error("Error deleting product image:", error);
          return false;
        }

        return true;
      } catch (error) {
        console.error("Error in deleteFromUrl:", error);
        return false;
      }
    },
  };
}
