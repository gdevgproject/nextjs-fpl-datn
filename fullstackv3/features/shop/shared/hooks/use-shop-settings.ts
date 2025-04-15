"use client";

import type { ShopSettings } from "@/lib/types/shared.types";
import { useQuery } from "@tanstack/react-query";
import { QUERY_STALE_TIME } from "@/lib/hooks/use-query-config";
import { fetchShopSettings } from "@/features/shop/shared/services";

// Query keys for shop settings
export const SHOP_QUERY_KEYS = {
  SHOP_SETTINGS: ["shop-settings"] as const,
};

/**
 * Custom hook to fetch and cache shop settings
 * Uses TanStack Query for client-side data fetching with caching
 * This follows the dev-guide.txt pattern for client-side data fetching
 */
export function useShopSettings() {
  const { data, isLoading, error } = useQuery({
    queryKey: SHOP_QUERY_KEYS.SHOP_SETTINGS,
    queryFn: fetchShopSettings,
    staleTime: QUERY_STALE_TIME.CATEGORY, // Using a long stale time since shop settings rarely change
    // Providing default data improves UX by avoiding null checks
    placeholderData: {
      id: 0,
      shop_name: "MyBeauty",
      shop_logo_url: "/placeholder-logo.png",
    } as ShopSettings,
  });

  return {
    settings: data,
    isLoading,
    error,
  };
}
