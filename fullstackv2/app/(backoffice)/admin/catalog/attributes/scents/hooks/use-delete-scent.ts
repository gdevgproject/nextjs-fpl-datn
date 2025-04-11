"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useDeleteScent() {
  return useClientMutation("scents", "delete", {
    invalidateQueries: [["scents", "list"]],
    primaryKey: "id",
  })
}
