"use client";

import { useClientMutation } from "@/shared/hooks/use-client-mutation";

export function useCreateBanner() {
  return useClientMutation("banners", "insert", {
    invalidateQueries: [["banners", "list"]],
    primaryKey: "id",
  });
}
