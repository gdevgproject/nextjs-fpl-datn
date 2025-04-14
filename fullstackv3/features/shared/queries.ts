import { createClient } from "@supabase/supabase-js"
import type { ShopSettings } from "@/lib/types/shared.types"

// Tạo Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Fetch shop settings
export async function getShopSettings(): Promise<ShopSettings> {
  const { data, error } = await supabase.from("shop_settings").select("*").single()

  if (error) {
    console.error("Error fetching shop settings:", error)
    throw new Error("Failed to fetch shop settings")
  }

  return data
}

// Query keys
export const QUERY_KEYS = {
  SHOP_SETTINGS: ["shop-settings"],
}

