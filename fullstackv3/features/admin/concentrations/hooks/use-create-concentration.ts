"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useCreateConcentration() {
  return useClientMutation("concentrations", "insert", {
    invalidateQueries: [["concentrations", "list"]],
    primaryKey: "id",
  })
}
