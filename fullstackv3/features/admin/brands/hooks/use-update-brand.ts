"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useUpdateBrand() {
  return useClientMutation("brands", "update", {
    invalidateQueries: [["brands", "list"]],
    primaryKey: "id",
  })
}
