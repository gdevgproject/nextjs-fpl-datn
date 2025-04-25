"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  softDeleteProductAction,
  restoreProductAction,
  hardDeleteProductAction,
} from "../actions";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

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
      console.error("Product deletion error:", error);
      toast.error("Error", {
        description: error.message || "An error occurred during the operation",
      });
    },
  };

  // Soft delete mutation
  const softDeleteMutation = useMutation({
    mutationFn: async (productId: number) => {
      const result = await softDeleteProductAction(productId);
      if (!result.success) {
        throw new Error(result.error || "Failed to delete product");
      }
      return result;
    },
    ...baseMutationConfig,
    onSuccess: () => {
      baseMutationConfig.onSuccess();
      toast.success("Success", {
        description: "Product deleted successfully",
      });
    },
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: async (productId: number) => {
      const result = await restoreProductAction(productId);
      if (!result.success) {
        throw new Error(result.error || "Failed to restore product");
      }
      return result;
    },
    ...baseMutationConfig,
    onSuccess: () => {
      baseMutationConfig.onSuccess();
      toast.success("Success", {
        description: "Product restored successfully",
      });
    },
  });

  // Hard delete mutation
  const hardDeleteMutation = useMutation({
    mutationFn: async (productId: number) => {
      const result = await hardDeleteProductAction(productId);
      if (!result.success) {
        throw new Error(result.error || "Failed to permanently delete product");
      }
      return result;
    },
    ...baseMutationConfig,
    onSuccess: () => {
      baseMutationConfig.onSuccess();
      toast.success("Success", {
        description: "Product permanently deleted",
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
