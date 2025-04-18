"use client"

import { useClientFetch } from "@/shared/hooks/use-client-fetch"

export function useOrderStatuses() {
  return useClientFetch(["order_statuses", "list"], "order_statuses", {
    columns: "id, name, description",
    sort: [{ column: "id", ascending: true }],
  })
}
