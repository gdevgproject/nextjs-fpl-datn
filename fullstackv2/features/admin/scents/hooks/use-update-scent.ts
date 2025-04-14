"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useUpdateScent() {
  return useClientMutation("scents", "update", {
    invalidateQueries: [["scents", "list"]],
    primaryKey: "id",
  })
}
