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
      data: { order_status_id: number; notify_customer?: boolean };
    }) => {
      const result = await updateOrderStatusAction({
        id,
        order_status_id: data.order_status_id,
        notify_customer: data.notify_customer,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to update order status");
      }

      return result.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate các query liên quan để trigger refetch

      // Invalidate danh sách đơn hàng
      queryClient.invalidateQueries({ queryKey: ["orders", "list"] });

      // Invalidate chi tiết đơn hàng cụ thể này
      queryClient.invalidateQueries({
        queryKey: ["orders", "details", variables.id],
      });

      // Invalidate tất cả query liên quan đến đơn hàng
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "orders",
      });

      // Cập nhật lại cache cho order này
      const updatedOrder = {
        id: variables.id,
        order_status_id: data.order_status_id,
      };

      // Cập nhật cache một cách thủ công nếu cần
      queryClient.setQueryData(
        ["orders", "details", variables.id],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            order_status_id: data.order_status_id,
          };
        }
      );
    },
  });
}
