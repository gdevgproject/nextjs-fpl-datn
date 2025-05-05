"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderStatusAction } from "../actions";
import { useState, useCallback } from "react";
import { OrderWithRelations, OrderStatus } from "../types";

/**
 * Defined status transition rules based on business requirements
 */
export const ORDER_STATUS_TRANSITION_RULES = {
  // Status name mapped to allowed next statuses
  "Chờ xác nhận": ["Đã xác nhận", "Đã hủy"],
  "Đã xác nhận": ["Đang xử lý", "Đang giao", "Đã hủy"],
  "Đang xử lý": ["Đang giao", "Đã hủy"],
  "Đang giao": ["Đã giao"], // Removed "Đã hủy" - can no longer cancel orders in shipping
  "Đã giao": ["Đã hoàn thành"], // Removed "Đã hủy" - can no longer cancel delivered orders
  "Đã hoàn thành": [], // Removed "Đã hủy" - can no longer cancel completed orders
  "Đã hủy": [],
} as const;

type ValidationResult = {
  isValid: boolean;
  error?: string;
  warningLevel?: "warning" | "error" | "info";
};

/**
 * Hook for updating an order's status with comprehensive validations
 * Implements business logic for order status transitions
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
  });

  /**
   * Validate the status transition based on business rules
   * Enhanced to include all conditions from the database schema and business logic
   */
  const validateStatusTransition = useCallback(
    (
      order: OrderWithRelations,
      newStatusId: number,
      allStatuses: OrderStatus[]
    ): ValidationResult => {
      // Find current and new status objects
      const currentStatus = allStatuses.find(
        (s) => s.id === order.order_status_id
      );
      const newStatus = allStatuses.find((s) => s.id === newStatusId);

      if (!currentStatus || !newStatus) {
        return {
          isValid: false,
          error: "Không thể xác định trạng thái hiện tại hoặc trạng thái mới.",
          warningLevel: "error",
        };
      }

      // If no change, it's valid but no need to proceed
      if (currentStatus.id === newStatus.id) {
        return { isValid: true };
      }

      // Check if the order is already cancelled
      if (currentStatus.name === "Đã hủy") {
        return {
          isValid: false,
          error: "Không thể thay đổi trạng thái của đơn hàng đã hủy.",
          warningLevel: "error",
        };
      }

      // Check if the order is already completed (only can cancel)
      if (
        currentStatus.name === "Đã hoàn thành" &&
        newStatus.name !== "Đã hủy"
      ) {
        return {
          isValid: false,
          error: "Đơn hàng đã hoàn thành, chỉ có thể hủy nếu cần thiết.",
          warningLevel: "error",
        };
      }

      // Check valid transitions based on workflow rules
      const allowedNextStatuses =
        ORDER_STATUS_TRANSITION_RULES[
          currentStatus.name as keyof typeof ORDER_STATUS_TRANSITION_RULES
        ] || [];
      if (!allowedNextStatuses.includes(newStatus.name)) {
        return {
          isValid: false,
          error: `Không thể chuyển trạng thái từ "${currentStatus.name}" sang "${newStatus.name}".`,
          warningLevel: "error",
        };
      }

      // ===== ENHANCED VALIDATION BASED ON BUSINESS RULES =====

      // 1. From "Chờ xác nhận" to "Đã xác nhận"
      if (
        currentStatus.name === "Chờ xác nhận" &&
        newStatus.name === "Đã xác nhận"
      ) {
        // Optional check - In real implementation, should check stock levels
        return {
          isValid: true,
          error:
            "Hãy đảm bảo kiểm tra tồn kho cho các sản phẩm trong đơn hàng trước khi xác nhận.",
          warningLevel: "info",
        };
      }

      // 2. From "Đã xác nhận" or "Đang xử lý" to "Đang giao"
      if (
        (currentStatus.name === "Đã xác nhận" ||
          currentStatus.name === "Đang xử lý") &&
        newStatus.name === "Đang giao"
      ) {
        // Critical: Must have assigned shipper
        if (!order.assigned_shipper_id) {
          return {
            isValid: false,
            error:
              "Cần gán shipper trước khi chuyển sang trạng thái Đang giao.",
            warningLevel: "error",
          };
        }

        // Important: For non-COD orders, payment should be completed
        if (order.payment_method_id !== 1 && order.payment_status !== "Paid") {
          return {
            isValid: false,
            error:
              "Đơn hàng thanh toán online này chưa được thanh toán. Không thể chuyển sang giao hàng.",
            warningLevel: "error",
          };
        }
      }

      // 3. From "Đang giao" to "Đã giao"
      // This is a critical transition that triggers inventory changes
      if (currentStatus.name === "Đang giao" && newStatus.name === "Đã giao") {
        // We could perform additional validations here
        // For example, check if the shipper has confirmed delivery in their app

        return {
          isValid: true,
          error:
            "Lưu ý: Khi chuyển sang trạng thái Đã giao, hệ thống sẽ tự động cập nhật tồn kho.",
          warningLevel: "info",
        };
      }

      // 4. From "Đã giao" to "Đã hoàn thành"
      if (
        currentStatus.name === "Đã giao" &&
        newStatus.name === "Đã hoàn thành"
      ) {
        // Payment must be completed before completing the order
        if (order.payment_status !== "Paid") {
          return {
            isValid: false,
            error: "Không thể hoàn thành đơn hàng chưa được thanh toán.",
            warningLevel: "error",
          };
        }
      }

      // 5. Any status to "Đã hủy" (Cancel order)
      if (newStatus.name === "Đã hủy") {
        // Không cho phép hủy đơn hàng ở các trạng thái sau: "Đang giao", "Đã giao", "Đã hoàn thành"
        if (
          ["Đang giao", "Đã giao", "Đã hoàn thành"].includes(currentStatus.name)
        ) {
          return {
            isValid: false,
            error: `Không thể hủy đơn hàng ở trạng thái "${currentStatus.name}".`,
            warningLevel: "error",
          };
        }

        // Nếu đơn hàng đã thanh toán, hiển thị cảnh báo (nhưng vẫn cho phép hủy)
        if (order.payment_status === "Paid") {
          return {
            isValid: true,
            error:
              "Đơn hàng đã được thanh toán. Hủy đơn sẽ yêu cầu hoàn tiền cho khách hàng.",
            warningLevel: "warning",
          };
        }
      }

      return { isValid: true };
    },
    []
  );

  const mutation = useMutation({
    mutationFn: async ({
      id,
      data,
      order,
      allStatuses,
    }: {
      id: number;
      data: { order_status_id: number };
      order: OrderWithRelations;
      allStatuses: OrderStatus[];
    }) => {
      // Validate before submitting to server
      const validation = validateStatusTransition(
        order,
        data.order_status_id,
        allStatuses
      );
      setValidationResult(validation);

      if (!validation.isValid) {
        throw new Error(validation.error || "Chuyển trạng thái không hợp lệ");
      }

      const result = await updateOrderStatusAction({
        id,
        order_status_id: data.order_status_id,
      });

      if (!result.success) {
        throw new Error(
          result.error || "Cập nhật trạng thái đơn hàng thất bại"
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

      // Tìm status mới từ danh sách statuses
      const newStatus = variables.allStatuses.find(
        (s) => s.id === variables.data.order_status_id
      );

      // Optimistically update order details trong cache
      if (previousOrderDetails) {
        // Tạo bản update mới cho order
        queryClient.setQueryData(
          ["orders", "details", variables.id],
          (oldData: any) => {
            if (!oldData || !oldData.data) return oldData;

            // Cập nhật optimistic với đầy đủ thông tin status
            return {
              ...oldData,
              data: {
                ...oldData.data,
                order_status_id: variables.data.order_status_id,
                order_statuses: newStatus || oldData.data.order_statuses,
                updated_at: new Date().toISOString(),
              },
            };
          }
        );
      }

      // Quan trọng: Tạm dừng các refetch tự động trong quá trình mutation
      await queryClient.cancelQueries({
        queryKey: ["orders", "details", variables.id],
      });

      return { previousOrderDetails };
    },
    onSuccess: (data, variables, context) => {
      // Clear previous validation results on success
      setValidationResult({ isValid: true });

      // Cập nhật cache với dữ liệu chính xác nhất từ server response
      if (data) {
        queryClient.setQueryData(
          ["orders", "details", variables.id],
          (oldData: any) => {
            if (!oldData) return oldData;

            // Tìm status mới từ allStatuses
            const newStatus = variables.allStatuses.find(
              (s) => s.id === data.order_status_id
            );

            return {
              ...oldData,
              data: {
                ...oldData.data,
                ...data,
                order_statuses: newStatus || oldData.data.order_statuses,
              },
            };
          }
        );
      }

      // Invalidate các query liên quan để trigger refetch
      // Ưu tiên invalidate chi tiết đơn hàng hiện tại trước
      queryClient.invalidateQueries({
        queryKey: ["orders", "details", variables.id],
        exact: true,
        refetchType: "active",
      });

      // Sau đó invalidate các queries khác liên quan đến orders
      queryClient.invalidateQueries({
        queryKey: ["orders", "list"],
        refetchType: "active",
      });
    },
    onError: (error, variables, context) => {
      // If there's no validation result set yet, this is a server error
      if (validationResult.isValid) {
        setValidationResult({
          isValid: false,
          error: error.message,
          warningLevel: "error",
        });
      }

      // Khôi phục lại state trước khi optimistic update nếu có lỗi
      if (context?.previousOrderDetails) {
        queryClient.setQueryData(
          ["orders", "details", variables.id],
          context.previousOrderDetails
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Đảm bảo refresh dữ liệu sau khi hoàn thành,
      // bất kể thành công hay thất bại
      queryClient.invalidateQueries({
        queryKey: ["orders", "details", variables.id],
        exact: true,
      });
    },
  });

  // Fix: Ensure we're properly wrapping the mutation function to prevent "is not a function" errors
  const updateOrderStatus = async (params: {
    id: number;
    data: { order_status_id: number };
    order: OrderWithRelations;
    allStatuses: OrderStatus[];
  }) => {
    try {
      return await mutation.mutateAsync(params);
    } catch (error) {
      throw error;
    }
  };

  return {
    updateOrderStatus,
    isUpdating: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
    validationResult,
    checkValidation: validateStatusTransition,
    resetValidation: () => setValidationResult({ isValid: true }),
  };
}
