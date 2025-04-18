"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useUpdateOrderStatus() {
  return useClientMutation("orders", "update", {
    invalidateQueries: [
      ["orders", "list"],
      ["orders", "details"],
    ],
    primaryKey: "id",
  })
}
