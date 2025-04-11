"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useUpdateConcentration() {
  return useClientMutation("concentrations", "update", {
    invalidateQueries: [["concentrations", "list"]],
    primaryKey: "id",
  })
}
