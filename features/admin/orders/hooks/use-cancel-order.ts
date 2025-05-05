"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelOrderAction } from "../actions";
import { OrderWithRelations } from "../types";
import { useState } from "react";
import { useAuthQuery } from "@/features/auth/hooks";

type CancelOrderParams = {
  id: number;
  reason: string;
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
  
  // Get authentication session to determine user role
  const { data: session } = useAuthQuery();
  const userRole = session?.user?.app_metadata?.role || "authenticated";
  const isShipper = userRole === "shipper";

  /**
   * Validate if the order can be cancelled based on business rules
   * @param order The order to validate
   */
  const validateCancellation = (
    order: OrderWithRelations
  ): ValidationResult => {
    // Shipper không được phép hủy đơn hàng trong mọi trường hợp
    if (isShipper) {
      return {
        isValid: false,
        error: "Shipper không được phép hủy đơn hàng",
        warningLevel: "error",
      };
    }

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

    // Check current status - Cannot cancel orders that are already delivered, completed, or being delivered
    const currentOrderStatus = order.order_statuses?.name;

    // This is our main enhanced validation - restrict cancellation for specific statuses
    const nonCancellableStatuses = [
      "Đang giao",
      "Đã giao",
      "Đã hoàn thành",
      "Đã hủy",
    ];

    if (currentOrderStatus === "Đã hoàn thành") {
      return {
        isValid: false,
        error:
          "Đơn hàng đã hoàn thành không thể hủy. Đây là trạng thái cuối của quy trình.",
        warningLevel: "error",
      };
    } else if (nonCancellableStatuses.includes(currentOrderStatus)) {
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

    // Order can be cancelled without warnings
    return { isValid: true };
  };

  const mutation = useMutation({
    mutationFn: async (params: CancelOrderParams) => {
      // Shipper không được phép hủy đơn hàng trong mọi trường hợp
      if (isShipper) {
        throw new Error("Shipper không được phép hủy đơn hàng");
      }

      const result = await cancelOrderAction({
        id: params.id,
        reason: params.reason,
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
    // Return the mutation object itself, not just mutateAsync
    // This ensures all properties like mutateAsync are properly exposed
    ...mutation,
    validationResult,
    validateCancellation,
  };
}
