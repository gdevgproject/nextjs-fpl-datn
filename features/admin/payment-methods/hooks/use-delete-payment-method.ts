"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useDeletePaymentMethod() {
  return useClientMutation("payment_methods", "delete", {
    invalidateQueries: [["payment-methods", "list"]],
    primaryKey: "id",
  })
}
