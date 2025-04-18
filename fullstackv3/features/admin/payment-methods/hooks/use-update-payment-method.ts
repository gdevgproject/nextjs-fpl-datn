"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useUpdatePaymentMethod() {
  return useClientMutation("payment_methods", "update", {
    invalidateQueries: [["payment-methods", "list"]],
    primaryKey: "id",
  })
}
