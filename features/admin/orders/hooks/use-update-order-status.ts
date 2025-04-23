"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderStatusAction } from "../actions";

/**
 * Hook for updating an order's status
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: { order_status_id: number };
    }) => {
      const result = await updateOrderStatusAction({
        id,
        order_status_id: data.order_status_id,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to update order status");
      }

      return result.data;
    },
    onSuccess: () => {
      // Invalidate related queries to trigger refetches
      queryClient.invalidateQueries({ queryKey: ["orders", "list"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "details"] });
    },
  });
}
