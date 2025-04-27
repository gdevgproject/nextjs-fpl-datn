"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import {
  checkProductCanDeleteAction,
  hardDeleteProductAction,
} from "../actions";

export interface ProductDeleteValidationResult {
  canDelete: boolean;
  variantResults: Array<{
    variantId: number;
    canDelete: boolean;
    blockingReasons: string[];
  }>;
}

/**
 * Hook for hard-deleting a product with variant-level validation.
 */
export function useProductHardDelete() {
  const toast = useSonnerToast();
  const queryClient = useQueryClient();

  const [validationResult, setValidationResult] =
    useState<ProductDeleteValidationResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  const checkMutation = useMutation({
    mutationFn: async (productId: number) => {
      setIsChecking(true);
      try {
        const result = await checkProductCanDeleteAction(productId);
        if (!result.success)
          throw new Error(result.error || "Kiểm tra thất bại");
        return result as ProductDeleteValidationResult & { success: boolean };
      } finally {
        setIsChecking(false);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: number) => {
      // re-check before actual delete
      const check = await checkProductCanDeleteAction(productId);
      if (!check.success || !check.canDelete) {
        throw new Error(
          "Không thể xóa vĩnh viễn sản phẩm: Một số biến thể không đạt điều kiện"
        );
      }
      const res = await hardDeleteProductAction(productId);
      if (!res.success) throw new Error(res.error || "Xóa sản phẩm thất bại");
      return { id: productId };
    },
    onSuccess: (_data, variables) => {
      toast.success("Sản phẩm đã được xóa vĩnh viễn thành công");
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["products", "byId", variables],
      });
      setProductToDelete(null);
      setValidationResult(null);
    },
    onError: (error: any) => {
      toast.error(
        `Lỗi: ${
          error instanceof Error ? error.message : "Không thể xóa sản phẩm"
        }`
      );
    },
  });

  const prepareDelete = async (productId: number) => {
    setProductToDelete(productId);
    try {
      const check = await checkMutation.mutateAsync(productId);
      setValidationResult(check as ProductDeleteValidationResult);
      return check;
    } catch (err) {
      toast.error(
        `Lỗi kiểm tra: ${
          err instanceof Error ? err.message : "Kiểm tra thất bại"
        }`
      );
      return null;
    }
  };

  const confirmDelete = async () => {
    if (productToDelete == null) return;
    await deleteMutation.mutateAsync(productToDelete);
  };

  const cancelDelete = () => {
    setProductToDelete(null);
    setValidationResult(null);
  };

  return {
    prepareDelete,
    confirmDelete,
    cancelDelete,
    validationResult,
    isChecking: isChecking || checkMutation.isPending,
    isDeleting: deleteMutation.isPending,
    productToDelete,
  };
}
