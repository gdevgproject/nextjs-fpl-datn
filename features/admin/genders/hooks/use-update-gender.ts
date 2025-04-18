"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useUpdateGender() {
  return useClientMutation("genders", "update", {
    invalidateQueries: [["genders", "list"]],
    primaryKey: "id",
  })
}
