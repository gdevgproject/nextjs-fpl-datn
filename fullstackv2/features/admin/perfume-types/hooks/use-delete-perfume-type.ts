"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useDeletePerfumeType() {
  return useClientMutation("perfume_types", "delete", {
    invalidateQueries: [["perfume_types", "list"]],
    primaryKey: "id",
  })
}
