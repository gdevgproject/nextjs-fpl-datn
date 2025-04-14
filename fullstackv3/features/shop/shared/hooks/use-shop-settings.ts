"use client"

import { createClientComponentClient } from "@supabase/ssr"
import type { ShopSettings } from "@/lib/types/shared.types"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "../queries"
import { QUERY_STALE_TIME } from "@/lib/hooks/use-query-config"

// Client-side function to fetch shop settings
async function fetchShopSettings(): Promise<ShopSettings> {
  const supabase = createClientComponentClient()

  const { data, error } = await supabase.from("shop_settings").select("*").single()

  if (error) {
    console.error("Error fetching shop settings:", error)
    throw new Error("Failed to fetch shop settings")
  }

  return data
}

export function useShopSettings() {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.SHOP_SETTINGS,
    queryFn: fetchShopSettings,
    staleTime: QUERY_STALE_TIME.CATEGORY, // Using a long stale time since shop settings rarely change
  })

  return {
    settings: data,
    isLoading,
    error,
  }
}

