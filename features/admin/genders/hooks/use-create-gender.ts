"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useCreateGender() {
  return useClientMutation("genders", "insert", {
    invalidateQueries: [["genders", "list"]],
    primaryKey: "id",
  })
}
