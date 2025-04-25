"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { StorageError } from "@supabase/storage-js";

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
        const paths = Array.isArray(pathsToDelete)
          ? pathsToDelete
          : [pathsToDelete];

        if (paths.length === 0) {
          return { data: [] };
        }

        // Delete files from storage bucket
        const { data, error } = await supabase.storage
          .from("products")
          .remove(paths);

        if (error) {
          throw error;
        }

        return { data };
      } catch (error) {
        console.error("Lỗi khi xóa file:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate product images queries
      queryClient.invalidateQueries({
        queryKey: ["product_images", "by_product"],
      });

      toast.success("Thành công", {
        description: "Đã xóa hình ảnh sản phẩm thành công",
      });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi không xác định";
      console.error(
        `Lỗi xóa file trong storage (bucket: products):`,
        errorMessage
      );

      toast.error("Lỗi", {
        description: `Không thể xóa hình ảnh: ${errorMessage}`,
      });
    },
  });

  /**
   * Helper method to delete a file from its full URL
   */
  const deleteFromUrl = async (url: string): Promise<boolean> => {
    try {
      // Extract path from URL
      // URL format: https://[projectRef].supabase.co/storage/v1/object/public/[bucket]/[path]
      const urlParts = url.split("/storage/v1/object/public/products/");

      if (urlParts.length !== 2) {
        throw new Error("URL không hợp lệ");
      }

      const path = urlParts[1];
      await deleteStorageMutation.mutateAsync(path);
      return true;
    } catch (error) {
      console.error(`Lỗi xóa file từ URL (${url}):`, error);
      return false;
    }
  };

  // Return the original mutation with enhanced functionality
  return {
    ...deleteStorageMutation,
    deleteFromUrl,
  };
}
