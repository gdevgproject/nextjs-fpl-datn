"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useUpdateProduct() {
  return useClientMutation("products", "update", {
    invalidateQueries: [["products", "list"]],
    primaryKey: "id",
  })
}
