"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useCreateScent() {
  return useClientMutation("scents", "insert", {
    invalidateQueries: [["scents", "list"]],
    primaryKey: "id",
  })
}
