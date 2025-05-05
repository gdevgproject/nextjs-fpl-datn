"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePaymentStatusAction } from "../actions";
import { useState } from "react";
import { OrderWithRelations } from "../types";

/**
 * Hook for confirming COD payment for orders that have been delivered
 * This should only work for COD orders in "Delivered" status
 */
export function useConfirmCodPayment() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async ({
      id,
      payment_status = "Paid",
    }: {
      id: number;
      payment_status?: string;
    }) => {
      const result = await updatePaymentStatusAction({
        id,
        payment_status,
      });

      if (!result.success) {
        throw new Error(
          result.error || "Cập nhật trạng thái thanh toán thất bại"
        );
      }

      return result.data;
    },

    onMutate: async (variables) => {
      // Lưu trữ trước khi thực hiện optimistic update
      const previousOrderDetails = queryClient.getQueryData([
        "orders",
        "details",
        variables.id,
      ]);

      // Optimistically update order details trong cache
      if (previousOrderDetails) {
        queryClient.setQueryData(
          ["orders", "details", variables.id],
          (oldData: any) => {
            if (!oldData || !oldData.data) return oldData;

            return {
              ...oldData,
              data: {
                ...oldData.data,
                payment_status: variables.payment_status || "Paid",
                updated_at: new Date().toISOString(),
              },
            };
          }
        );
      }

      // Tạm dừng các refetch tự động trong quá trình mutation
      await queryClient.cancelQueries({
        queryKey: ["orders", "details", variables.id],
      });

      return { previousOrderDetails };
    },

    onSuccess: (data, variables) => {
      // Cập nhật cache với dữ liệu mới từ server
      if (data) {
        queryClient.setQueryData(
          ["orders", "details", variables.id],
          (oldData: any) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              data: {
                ...oldData.data,
                ...data,
              },
            };
          }
        );
      }

      // Cập nhật danh sách đơn hàng để phản ánh trạng thái thanh toán mới
      queryClient.invalidateQueries({
        queryKey: ["orders", "list"],
        refetchType: "active",
      });

      // Xóa lỗi nếu thành công
      setError(null);
    },

    onError: (error: Error, variables, context) => {
      // Lưu lỗi để hiển thị
      setError(error.message);

      // Khôi phục lại state trước khi optimistic update nếu có lỗi
      if (context?.previousOrderDetails) {
        queryClient.setQueryData(
          ["orders", "details", variables.id],
          context.previousOrderDetails
        );
      }
    },
  });

  /**
   * Xác nhận thanh toán COD cho đơn hàng
   * @param orderId ID của đơn hàng cần xác nhận thanh toán
   * @returns Promise với kết quả cập nhật
   */
  const confirmCodPayment = async (orderId: number) => {
    try {
      return await mutation.mutateAsync({
        id: orderId,
        payment_status: "Paid",
      });
    } catch (error) {
      throw error;
    }
  };

  /**
   * Đặt lại trạng thái thanh toán thành chưa thanh toán (chỉ trong trường hợp đặc biệt)
   * @param orderId ID của đơn hàng cần đặt lại trạng thái
   * @returns Promise với kết quả cập nhật
   */
  const resetToUnpaid = async (orderId: number) => {
    try {
      return await mutation.mutateAsync({
        id: orderId,
        payment_status: "Pending",
      });
    } catch (error) {
      throw error;
    }
  };

  /**
   * Kiểm tra xem đơn hàng có phải là COD và đã giao hay không
   * @param order Đối tượng đơn hàng cần kiểm tra
   * @returns Boolean cho biết có thể xác nhận thanh toán hay không
   */
  const canConfirmPayment = (order: OrderWithRelations | null): boolean => {
    if (!order) return false;

    // Kiểm tra phương thức thanh toán có phải COD không
    const isCod = order.payment_methods?.name.toLowerCase().includes("cod");

    // Kiểm tra trạng thái đơn hàng có phải "Đã giao" hay không
    const isDelivered = order.order_statuses?.name === "Đã giao";

    // Kiểm tra trạng thái thanh toán chưa được thanh toán
    const isPending = order.payment_status === "Pending";

    // Chỉ cho phép xác nhận nếu là đơn COD đã giao và chưa được thanh toán
    return !!isCod && isDelivered && isPending;
  };

  return {
    confirmCodPayment,
    resetToUnpaid,
    canConfirmPayment,
    isUpdating: mutation.isPending,
    error,
    clearError: () => setError(null),
  };
}
