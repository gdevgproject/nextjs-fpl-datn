"use client"

import { useClientRpcMutation } from "@/shared/hooks/use-client-rpc"

interface AdjustStockParams {
  p_variant_id: number
  p_change_amount: number
  p_reason: string
}

export function useAdjustStock() {
  return useClientRpcMutation<number, AdjustStockParams>("adjust_stock", {
    invalidateQueries: [
      ["inventory", "list"],
      ["product_variants", "list"],
    ],
  })
}
