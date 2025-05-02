"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelOrderAction } from "../actions";
import { OrderWithRelations } from "../types";
import { useState } from "react";

type CancelOrderParams = {
  id: number;
  reason: string;
  notify_customer?: boolean;
};

type ValidationResult = {
  isValid: boolean;
  error?: string;
  warningLevel?: "warning" | "error" | "info";
};

/**
 * Hook for cancelling orders with comprehensive validation
 * @returns Functions to cancel orders and validation status
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
  });

  /**
   * Validate if the order can be cancelled based on business rules
   * @param order The order to validate
   */
  const validateCancellation = (
    order: OrderWithRelations
  ): ValidationResult => {
    if (!order) {
      return {
        isValid: false,
        error: "Không thể tìm thấy thông tin đơn hàng",
        warningLevel: "error",
      };
    }

    // Check if the order is already cancelled
    if (order.cancellation_reason) {
      return {
        isValid: false,
        error: "Đơn hàng này đã bị hủy trước đó.",
        warningLevel: "error",
      };
    }

    // Check current status - Cannot cancel orders that are already delivered or completed
    const currentOrderStatus = order.order_statuses?.name;
    if (["Đã giao", "Đã hoàn thành"].includes(currentOrderStatus)) {
      return {
        isValid: false,
        error: `Không thể hủy đơn hàng ở trạng thái "${currentOrderStatus}".`,
        warningLevel: "error",
      };
    }

    // Warn about payment impact for orders that are already paid
    if (order.payment_status === "Paid") {
      return {
        isValid: true,
        error:
          "Đơn hàng đã thanh toán. Hủy đơn sẽ yêu cầu hoàn tiền cho khách hàng.",
        warningLevel: "warning",
      };
    }

    // If order is in shipping status, add a warning
    if (currentOrderStatus === "Đang giao") {
      return {
        isValid: true,
        error:
          "Đơn hàng đang trong quá trình giao. Hãy liên hệ với shipper trước khi hủy.",
        warningLevel: "warning",
      };
    }

    // Order can be cancelled without warnings
    return { isValid: true };
  };

  const mutation = useMutation({
    mutationFn: async (params: CancelOrderParams) => {
      const result = await cancelOrderAction({
        id: params.id,
        reason: params.reason,
        notify_customer: params.notify_customer,
      });

      if (!result.success) {
        throw new Error(result.error || "Hủy đơn hàng thất bại");
      }

      return result.data;
    },
    onSuccess: (data, variables) => {
      // Reset validation state
      setValidationResult({ isValid: true });

      // Invalidate relevant queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["orders", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["orders", "details", variables.id],
      });
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "orders",
      });
    },
    onError: (error) => {
      setValidationResult({
        isValid: false,
        error: error instanceof Error ? error.message : "Lỗi không xác định",
        warningLevel: "error",
      });
    },
  });

  return {
    cancelOrder: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
    validationResult,
    validateCancellation,
  };
}
