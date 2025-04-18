"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useDeleteGender() {
  return useClientMutation("genders", "delete", {
    invalidateQueries: [["genders", "list"]],
    primaryKey: "id",
  })
}
