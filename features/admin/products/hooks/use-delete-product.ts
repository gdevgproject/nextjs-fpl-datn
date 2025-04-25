"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

const supabase = getSupabaseBrowserClient();

/**
 * Hook for product deletion operations (soft delete, restore, hard delete)
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

  // Base mutation configuration for all delete operations
  const baseMutationConfig = {
    onSuccess: () => {
      // Invalidate products list query to refetch
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
    },
    onError: (error: Error) => {
      console.error("Lỗi xóa sản phẩm:", error);
    },
  };

  // Soft delete mutation
  const softDeleteMutation = useMutation({
    mutationFn: async (productId: number) => {
      const { data, error } = await supabase
        .from("products")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", productId)
        .select();

      if (error) {
        throw new Error(error.message || "Không thể xóa sản phẩm");
      }

      return data;
    },
    ...baseMutationConfig,
    onSuccess: () => {
      baseMutationConfig.onSuccess();
      toast.success("Thành công", {
        description: "Sản phẩm đã được xóa tạm thời",
      });
    },
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: async (productId: number) => {
      const { data, error } = await supabase
        .from("products")
        .update({ deleted_at: null })
        .eq("id", productId)
        .select();

      if (error) {
        throw new Error(error.message || "Không thể khôi phục sản phẩm");
      }

      return data;
    },
    ...baseMutationConfig,
    onSuccess: () => {
      baseMutationConfig.onSuccess();
      toast.success("Thành công", {
        description: "Sản phẩm đã được khôi phục",
      });
    },
  });

  // Hard delete mutation
  const hardDeleteMutation = useMutation({
    mutationFn: async (productId: number) => {
      // Get product images to delete from storage later
      const { data: images } = await supabase
        .from("product_images")
        .select("image_url")
        .eq("product_id", productId);

      // Delete the product from the database
      const { data, error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) {
        throw new Error(error.message || "Không thể xóa vĩnh viễn sản phẩm");
      }

      // TODO: Queue up a job to clean up orphaned images in storage
      // This should be done in a server action or background job
      // to prevent storage links from being orphaned

      return { data, images };
    },
    ...baseMutationConfig,
    onSuccess: () => {
      baseMutationConfig.onSuccess();
      toast.success("Thành công", {
        description: "Sản phẩm đã được xóa vĩnh viễn",
      });
    },
  });

  // Return the mutations with simplified interface
  return {
    softDelete: softDeleteMutation.mutateAsync,
    restore: restoreMutation.mutateAsync,
    hardDelete: hardDeleteMutation.mutateAsync,
    isPending:
      softDeleteMutation.isPending ||
      restoreMutation.isPending ||
      hardDeleteMutation.isPending,
  };
}
