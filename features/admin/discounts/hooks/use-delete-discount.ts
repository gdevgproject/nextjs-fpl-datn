"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useDeleteDiscount() {
  return useClientMutation("discounts", "delete", {
    invalidateQueries: [["discounts", "list"]],
    primaryKey: "id",
  })
}
