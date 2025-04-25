"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StorageError } from "@supabase/storage-js";
import { extractStoragePath } from "../services";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

const supabase = getSupabaseBrowserClient();

/**
 * Hook for deleting product images from Supabase Storage
 */
export function useDeleteProductImages() {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

  const deleteStorageMutation = useMutation<
    { data: any[] | null },
    StorageError | Error,
    string | string[]
  >({
    mutationFn: async (pathsToDelete) => {
      try {
        // Convert single path to array for consistent handling
        const pathsArray = Array.isArray(pathsToDelete)
          ? pathsToDelete
          : [pathsToDelete];

        if (pathsArray.length === 0) return { data: [] };

        // Normalize paths to prevent issues
        const normalizedPaths = pathsArray.map((p) =>
          p.replace(/\/+/g, "/").replace(/^\/|\/$/g, "")
        );

        // Remove from storage
        const { data, error } = await supabase.storage
          .from("products")
          .remove(normalizedPaths);

        if (error) throw error;
        return { data };
      } catch (error) {
        console.error("Storage deletion error:", error);
        throw error instanceof StorageError
          ? error
          : new Error(String(error) || "Unknown storage deletion error");
      }
    },
    onSuccess: () => {
      // Invalidate product images queries
      queryClient.invalidateQueries({
        queryKey: ["product_images", "by_product"],
      });

      toast.success("Success", {
        description: "Product images deleted successfully",
      });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`Storage delete error (bucket: products):`, errorMessage);

      toast.error("Error", {
        description: `Failed to delete images: ${errorMessage}`,
      });
    },
  });

  /**
   * Helper method to delete a file from its full URL
   */
  const deleteFromUrl = async (url: string): Promise<boolean> => {
    try {
      if (!url) return false;

      // Extract path from URL using the shared service
      const path = extractStoragePath(url);
      if (!path) {
        console.error("Could not extract path from URL:", url);
        return false;
      }

      // Delete file using the main mutation
      await deleteStorageMutation.mutateAsync(path);
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Error in deleteFromUrl:", errorMessage);
      throw error;
    }
  };

  // Return the original mutation with enhanced functionality
  return {
    ...deleteStorageMutation,
    deleteFromUrl,
  };
}
