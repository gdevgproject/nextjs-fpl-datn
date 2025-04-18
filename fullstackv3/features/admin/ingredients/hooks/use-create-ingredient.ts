"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useCreateIngredient() {
  return useClientMutation("ingredients", "insert", {
    invalidateQueries: [["ingredients", "list"]],
    primaryKey: "id",
  })
}
