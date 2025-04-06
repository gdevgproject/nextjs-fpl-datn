import type { ShopSettings } from "@/lib/types/shared.types";

// Fetch shop settings - only for server components
export async function getShopSettings(): Promise<ShopSettings> {
  // Dynamically import the server client to prevent it from being included in client bundles
  const { getSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("shop_settings")
    .select("*")
    .single();

  if (error) {
    console.error("Error fetching shop settings:", error);
    throw new Error("Failed to fetch shop settings");
  }

  return data;
}

// Query keys
export const QUERY_KEYS = {
  SHOP_SETTINGS: ["shop-settings"],
};
