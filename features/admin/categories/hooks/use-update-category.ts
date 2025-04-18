"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useUpdateCategory() {
  return useClientMutation("categories", "update", {
    invalidateQueries: [["categories", "list"]],
    primaryKey: "id",
  })
}
