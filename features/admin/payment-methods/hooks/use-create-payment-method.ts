"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useCreatePaymentMethod() {
  return useClientMutation("payment_methods", "insert", {
    invalidateQueries: [["payment-methods", "list"]],
    primaryKey: "id",
  })
}
