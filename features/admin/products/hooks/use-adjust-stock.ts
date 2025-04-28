"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

interface AdjustStockParams {
  variantId: number;
  changeAmount: number;
  reason: string;
}

interface AdjustStockResult {
  success: boolean;
  newStockQuantity?: number;
  error?: string;
}

/**
 * Hook for adjusting product variant stock quantity with reason tracking
 */
export function useAdjustStock() {
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();
  const toast = useSonnerToast();
  const [isOpen, setIsOpen] = useState(false);
  const [currentVariant, setCurrentVariant] = useState<{
    id: number;
    productId: number;
    currentStock: number;
    newStock: number;
  } | null>(null);

  // Mutation for calling the adjust_stock RPC
  const adjustStockMutation = useMutation({
    mutationFn: async ({
      variantId,
      changeAmount,
      reason,
    }: AdjustStockParams): Promise<AdjustStockResult> => {
      try {
        // Validate inputs
        if (!variantId) {
          throw new Error("Thiếu ID biến thể sản phẩm");
        }

        if (!changeAmount || changeAmount === 0) {
          throw new Error("Số lượng thay đổi không được bằng 0");
        }

        if (!reason || reason.trim() === "") {
          throw new Error("Vui lòng cung cấp lý do điều chỉnh kho");
        }

        // Call the adjust_stock RPC
        const { data, error } = await supabase.rpc("adjust_stock", {
          p_variant_id: variantId,
          p_change_amount: changeAmount,
          p_reason: reason,
        });

        if (error) {
          console.error("Lỗi điều chỉnh tồn kho:", error);
          throw new Error(error.message || "Không thể điều chỉnh tồn kho");
        }

        return {
          success: true,
          newStockQuantity: data,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Lỗi không xác định",
        };
      }
    },
    onSuccess: (result, variables) => {
      if (result.success && currentVariant) {
        // Update the local UI to show the new stock
        queryClient.invalidateQueries({
          queryKey: ["product_variants", currentVariant.productId],
        });

        // Also invalidate products list query to update stock status
        queryClient.invalidateQueries({ queryKey: ["products", "list"] });

        // Also invalidate inventory history if that's being used
        queryClient.invalidateQueries({
          queryKey: ["inventory_history", variables.variantId],
        });

        toast.success("Cập nhật thành công", {
          description: `Đã ${
            variables.changeAmount > 0 ? "thêm" : "giảm"
          } ${Math.abs(variables.changeAmount)} vào kho. Tồn kho mới: ${
            result.newStockQuantity
          }`,
        });

        // Close dialog and reset state
        setIsOpen(false);
        setCurrentVariant(null);
      } else if (!result.success) {
        toast.error("Lỗi khi điều chỉnh kho", {
          description: result.error || "Không thể cập nhật tồn kho",
        });
      }
    },
    onError: (error) => {
      toast.error("Lỗi khi điều chỉnh kho", {
        description:
          error instanceof Error ? error.message : "Không thể cập nhật tồn kho",
      });
    },
  });

  // Function to prepare the stock adjustment
  const prepareAdjustStock = (
    variantId: number,
    productId: number,
    currentStock: number,
    newStock: number
  ) => {
    setCurrentVariant({
      id: variantId,
      productId,
      currentStock,
      newStock,
    });
    setIsOpen(true);
  };

  // Function to execute the stock adjustment with a reason
  const executeAdjustStock = async (reason: string) => {
    if (!currentVariant) return;

    const changeAmount = currentVariant.newStock - currentVariant.currentStock;

    // Don't proceed if trying to adjust by 0
    if (changeAmount === 0) {
      toast.error("Không có thay đổi", {
        description: "Số lượng tồn kho không thay đổi",
      });
      return;
    }

    return adjustStockMutation.mutateAsync({
      variantId: currentVariant.id,
      changeAmount,
      reason,
    });
  };

  // Function to cancel the stock adjustment
  const cancelAdjustStock = () => {
    setIsOpen(false);
    setCurrentVariant(null);
  };

  return {
    prepareAdjustStock,
    executeAdjustStock,
    cancelAdjustStock,
    isPending: adjustStockMutation.isPending,
    isOpen,
    currentVariant,
  };
}
