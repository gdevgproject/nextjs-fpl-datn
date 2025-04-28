"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

interface VariantInfo {
  id: number;
  productId: number;
  currentStock: number;
  newStock: number;
}

/**
 * Hook to handle stock adjustments with reason tracking
 * Uses the adjust_stock RPC function in Supabase
 */
export function useAdjustStock() {
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

  const [isOpen, setIsOpen] = useState(false);
  const [currentVariant, setCurrentVariant] = useState<VariantInfo | null>(
    null
  );

  // Mutation for adjusting stock
  const adjustStockMutation = useMutation({
    mutationFn: async ({
      variantId,
      changeAmount,
      reason,
    }: {
      variantId: number;
      changeAmount: number;
      reason: string;
    }) => {
      try {
        // Call the adjust_stock RPC function
        const { data, error } = await supabase.rpc("adjust_stock", {
          p_variant_id: variantId,
          p_change_amount: changeAmount,
          p_reason: reason,
        });

        if (error) {
          throw new Error(
            error.message || "Không thể điều chỉnh số lượng tồn kho"
          );
        }

        return data;
      } catch (error) {
        console.error("Error adjusting stock:", error);
        throw error;
      }
    },

    onSuccess: (_, variables) => {
      // Invalidate related queries to refresh data
      if (currentVariant) {
        // Invalidate product variants query
        queryClient.invalidateQueries({
          queryKey: ["product_variants", currentVariant.productId],
        });

        // Invalidate inventory history for this variant
        queryClient.invalidateQueries({
          queryKey: ["inventory_history", currentVariant.id],
        });

        // Invalidate products list to update stock status
        queryClient.invalidateQueries({
          queryKey: ["products", "list"],
        });

        // Show success toast with change details
        const changeAmount = variables.changeAmount;
        toast.success(
          changeAmount > 0
            ? "Đã thêm sản phẩm vào kho"
            : "Đã giảm số lượng tồn kho",
          {
            description: `${Math.abs(changeAmount)} sản phẩm đã được ${
              changeAmount > 0 ? "thêm vào" : "giảm khỏi"
            } kho với lý do: ${variables.reason}`,
          }
        );
      }

      // Reset state
      setIsOpen(false);
      setCurrentVariant(null);
    },

    onError: (error) => {
      toast.error("Lỗi khi điều chỉnh số lượng tồn kho", {
        description:
          error instanceof Error ? error.message : "Lỗi không xác định",
      });
    },
  });

  /**
   * Prepare to adjust stock by showing the dialog
   */
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

  /**
   * Execute the stock adjustment with the provided reason
   */
  const executeAdjustStock = (reason: string) => {
    if (!currentVariant) return;

    const changeAmount = currentVariant.newStock - currentVariant.currentStock;

    // Call the adjust_stock RPC
    adjustStockMutation.mutate({
      variantId: currentVariant.id,
      changeAmount,
      reason,
    });
  };

  /**
   * Cancel the current adjustment
   */
  const cancelAdjustStock = () => {
    setIsOpen(false);
    setCurrentVariant(null);
  };

  return {
    prepareAdjustStock,
    executeAdjustStock,
    cancelAdjustStock,
    isOpen,
    currentVariant,
    isPending: adjustStockMutation.isPending,
  };
}
