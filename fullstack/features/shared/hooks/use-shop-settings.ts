import { useQuery } from "@tanstack/react-query"
import { getShopSettings, QUERY_KEYS } from "../queries"
import { QUERY_STALE_TIME } from "@/lib/hooks/use-query-config"

export function useShopSettings() {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.SHOP_SETTINGS,
    queryFn: getShopSettings,
    staleTime: QUERY_STALE_TIME.CATEGORY, // Using a long stale time since shop settings rarely change
  })

  return {
    settings: data,
    isLoading,
    error,
  }
}

