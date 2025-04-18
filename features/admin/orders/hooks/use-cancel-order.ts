"use client"

import { useClientRpcMutation } from "@/shared/hooks/use-client-rpc"

export function useCancelOrder() {
  return useClientRpcMutation("cancel_order_by_admin", {
    invalidateQueries: [
      ["orders", "list"],
      ["orders", "details"],
    ],
  })
}
