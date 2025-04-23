"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignShipperAction } from "../actions";

/**
 * Hook for assigning a shipper to an order
 */
export function useAssignShipper() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      assigned_shipper_id,
    }: {
      id: number;
      assigned_shipper_id: string | null;
    }) => {
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
    },
  });
}
