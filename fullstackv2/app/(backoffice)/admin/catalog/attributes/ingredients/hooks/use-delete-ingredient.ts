"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useDeleteIngredient() {
  return useClientMutation("ingredients", "delete", {
    invalidateQueries: [["ingredients", "list"]],
    primaryKey: "id",
  })
}
