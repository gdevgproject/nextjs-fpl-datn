"use client";

import { usePaymentMethodMutation } from "./use-payment-methods-hooks";

export function useDeletePaymentMethod() {
  return usePaymentMethodMutation("delete", {
    invalidateQueries: [["payment-methods", "list"]],
    primaryKey: "id",
  });
}
