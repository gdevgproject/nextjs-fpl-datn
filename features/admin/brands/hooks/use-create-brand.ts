"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useCreateBrand() {
  return useClientMutation("brands", "insert", {
    invalidateQueries: [["brands", "list"]],
    primaryKey: "id",
  })
}
