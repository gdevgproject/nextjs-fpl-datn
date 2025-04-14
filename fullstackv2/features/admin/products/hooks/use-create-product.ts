"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useCreateProduct() {
  return useClientMutation("products", "insert", {
    invalidateQueries: [["products", "list"]],
    primaryKey: "id",
  })
}
