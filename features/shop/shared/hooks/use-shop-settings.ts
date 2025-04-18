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
export function useShopSettings(initialData?: ShopSettings) {
  const { data, isLoading, error } = useQuery({
    queryKey: SHOP_QUERY_KEYS.SHOP_SETTINGS,
    queryFn: fetchShopSettings,
    staleTime: QUERY_STALE_TIME.CATEGORY, // Using a long stale time since shop settings rarely change
    initialData,
  });

  return {
    settings: data,
    isLoading,
    error,
  };
}
