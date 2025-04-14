"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useCreateCategory() {
  return useClientMutation("categories", "insert", {
    invalidateQueries: [["categories", "list"]],
    primaryKey: "id",
  })
}
