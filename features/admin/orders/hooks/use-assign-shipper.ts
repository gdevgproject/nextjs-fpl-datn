"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignShipperAction } from "../actions";
import { useAuthQuery } from "@/features/auth/hooks";
import { useState } from "react";

/**
 * Hook for assigning a shipper to an order
 */
export function useAssignShipper() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Get authentication session to determine user role
  const { data: session } = useAuthQuery();
  const userRole = session?.user?.app_metadata?.role || "authenticated";
  const isShipper = userRole === "shipper";

  const mutation = useMutation({
    mutationFn: async ({
      id,
      assigned_shipper_id,
    }: {
      id: number;
      assigned_shipper_id: string | null;
    }) => {
      // Shipper không được phép gán hoặc thay đổi shipper
      if (isShipper) {
        throw new Error("Bạn không có quyền thực hiện thao tác này");
      }

      const result = await assignShipperAction({
        id,
        assigned_shipper_id,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to assign shipper");
      }

      return result.data;
    },
    onSuccess: () => {
      // Invalidate related queries to trigger refetches
      queryClient.invalidateQueries({ queryKey: ["orders", "list"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "details"] });
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  return {
    ...mutation,
    error,
    clearError: () => setError(null),
  };
}
