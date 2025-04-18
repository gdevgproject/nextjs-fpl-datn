"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useUpdateDiscount() {
  return useClientMutation("discounts", "update", {
    invalidateQueries: [["discounts", "list"]],
    primaryKey: "id",
  })
}
