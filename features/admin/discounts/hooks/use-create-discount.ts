"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDiscount } from "../services";
import { CreateDiscountInput } from "../actions";

/**
 * Hook for creating a new discount
 *
 * @returns Mutation hook for creating discounts with loading and error states
 */
export function useCreateDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDiscountInput) => createDiscount(data),
    onSuccess: () => {
      // Invalidate discounts queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
    },
  });
}
