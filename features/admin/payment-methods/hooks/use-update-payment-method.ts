"use client";

import { usePaymentMethodMutation } from "./use-payment-methods-hooks";

export function useUpdatePaymentMethod() {
  return usePaymentMethodMutation("update", {
    invalidateQueries: [["payment-methods", "list"]],
    primaryKey: "id",
  });
}
