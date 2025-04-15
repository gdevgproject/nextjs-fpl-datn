import type { ShopSettings } from "@/lib/types/shared.types";

/**
 * Fetch shop settings - only for server components
 * Uses dynamic import for server client to ensure it's not included in client bundles
 * @returns Shop settings data
 */
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
    // Return a default object instead of throwing to improve resilience
    return {
      id: 0,
      shop_name: "MyBeauty",
      shop_logo_url: "/placeholder-logo.png",
      contact_email: "info@mybeauty.vn",
      contact_phone: "0123 456 789",
    };
  }

  return data;
}

/**
 * Client-side function to fetch shop settings
 * This is exported for use in the client hooks
 * @returns Promise with shop settings data
 */
export async function fetchShopSettings(): Promise<ShopSettings> {
  const { getSupabaseBrowserClient } = await import("@/lib/supabase/client");
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("shop_settings")
    .select("*")
    .single();

  if (error) {
    console.error("Error fetching shop settings:", error);
    // Return a default object instead of throwing to improve resilience
    return {
      id: 0,
      shop_name: "MyBeauty",
      shop_logo_url: "/placeholder-logo.png",
      contact_email: "info@mybeauty.vn",
      contact_phone: "0123 456 789",
    };
  }

  return data;
}
