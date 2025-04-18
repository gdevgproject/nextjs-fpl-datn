"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useCreatePerfumeType() {
  return useClientMutation("perfume_types", "insert", {
    invalidateQueries: [["perfume_types", "list"]],
    primaryKey: "id",
  })
}
