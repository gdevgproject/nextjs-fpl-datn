"use client";

import { usePaymentMethodMutation } from "./use-payment-methods-hooks";

export function useCreatePaymentMethod() {
  return usePaymentMethodMutation("insert", {
    invalidateQueries: [["payment-methods", "list"]],
    primaryKey: "id",
  });
}
