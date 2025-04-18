"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useUpdateIngredient() {
  return useClientMutation("ingredients", "update", {
    invalidateQueries: [["ingredients", "list"]],
    primaryKey: "id",
  })
}
