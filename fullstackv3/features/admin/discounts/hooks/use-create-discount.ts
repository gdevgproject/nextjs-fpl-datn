"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useCreateDiscount() {
  return useClientMutation("discounts", "insert", {
    invalidateQueries: [["discounts", "list"]],
    primaryKey: "id",
  })
}
