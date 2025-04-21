"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDiscount } from "../services";
import { UpdateDiscountInput } from "../actions";

/**
 * Hook for updating an existing discount
 *
 * @returns Mutation hook for updating discounts with loading and error states
 */
export function useUpdateDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDiscountInput) => updateDiscount(data),
    onSuccess: () => {
      // Invalidate discounts queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
    },
  });
}
