"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelOrderAction } from "../actions";

/**
 * Hook for cancelling an order (by admin)
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      const result = await cancelOrderAction({ id, reason });

      if (!result.success) {
        throw new Error(result.error || "Failed to cancel order");
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate related queries to trigger refetches
      queryClient.invalidateQueries({ queryKey: ["orders", "list"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "details"] });
    },
  });
}
