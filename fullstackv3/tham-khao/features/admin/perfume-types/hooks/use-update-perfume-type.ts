"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useUpdatePerfumeType() {
  return useClientMutation("perfume_types", "update", {
    invalidateQueries: [["perfume_types", "list"]],
    primaryKey: "id",
  })
}
