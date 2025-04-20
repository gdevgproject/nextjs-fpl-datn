import { useQuery } from "@tanstack/react-query";
import { fetchAdminShopSettings } from "../services";
import type { ShopSettings } from "../types";

export const ADMIN_SHOP_QUERY_KEYS = {
  SHOP_SETTINGS: ["admin-shop-settings"] as const,
};

export function useShopSettings() {
  return useQuery<ShopSettings | null>({
    queryKey: ADMIN_SHOP_QUERY_KEYS.SHOP_SETTINGS,
    queryFn: fetchAdminShopSettings,
    staleTime: 1000 * 60 * 30, // 30 phút
  });
}
