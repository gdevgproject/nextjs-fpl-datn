"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StorageError } from "@supabase/storage-js";

const supabase = getSupabaseBrowserClient();

// Type definitions for the storage delete mutation
type DeleteMutationVariables = string | string[];

interface DeleteMutationResult {
  data: any[] | null;
}

export function useDeleteProductImages() {
  const queryClient = useQueryClient();

  const deleteStorageMutation = useMutation<
    DeleteMutationResult,
    StorageError | Error,
    DeleteMutationVariables
  >({
    mutationFn: async (pathsToDelete) => {
      try {
        const pathsArray = Array.isArray(pathsToDelete)
          ? pathsToDelete
          : [pathsToDelete];

        if (pathsArray.length === 0) return { data: [] };

        const normalizedPaths = pathsArray.map((p) =>
          p.replace(/\/+/g, "/").replace(/^\/|\/$/g, "")
        );

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
    },
    onError: (error) => {
      // Đảm bảo ghi log lỗi có thông tin rõ ràng
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`Storage delete error (bucket: products):`, errorMessage);
    },
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
        if (urlParts.length <= 1) {
          console.error("Invalid image URL format:", url);
          return false;
        }

        const path = urlParts[1];
        if (!path) {
          console.error("Could not extract path from URL:", url);
          return false;
        }

        // Delete file
        const { error } = await supabase.storage
          .from("products")
          .remove([path]);

        if (error) {
          console.error("Error deleting product image:", error);
          // Đặc biệt quan trọng: Chuyển đổi StorageError thành Error để xử lý nhất quán
          throw new Error(error.message || "Error deleting image from storage");
        }

        // Successfully deleted
        queryClient.invalidateQueries({
          queryKey: ["product_images", "by_product"],
        });
        return true;
      } catch (error) {
        // Chi tiết lỗi khi xóa ảnh từ URL
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error("Error in deleteFromUrl:", errorMessage);
        throw error; // Đảm bảo truyền lỗi để component xử lý
      }
    },
  };
}
