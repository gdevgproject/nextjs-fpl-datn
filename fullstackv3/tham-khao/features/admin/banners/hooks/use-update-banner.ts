"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"

export function useUpdateBanner() {
  return useClientMutation("banners", "update", {
    invalidateQueries: [["banners", "list"]],
    primaryKey: "id",
  })
}
