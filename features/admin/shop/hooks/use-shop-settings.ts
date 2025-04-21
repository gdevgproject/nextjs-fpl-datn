"use client";

import { useQuery } from "@tanstack/react-query";
import { getShopSettingsAction } from "../actions";
import { ShopSettings } from "../types";

/**
 * Hook to fetch shop settings data
 * @returns Query result with shop settings data
 */
export function useShopSettings() {
  return useQuery<ShopSettings>({
    queryKey: ["shop_settings"],
    queryFn: async () => {
      return getShopSettingsAction();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - shop settings don't change often
  });
}
