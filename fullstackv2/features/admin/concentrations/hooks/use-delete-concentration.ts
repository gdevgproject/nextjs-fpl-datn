"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useDeleteConcentration() {
  return useClientMutation("concentrations", "delete", {
    invalidateQueries: [["concentrations", "list"]],
    primaryKey: "id",
  })
}
