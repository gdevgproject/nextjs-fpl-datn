import { createClient } from "@/lib/supabase/server"; // Import createClient từ server.ts
import type { ShopSettings } from "@/lib/types/shared.types";

// Tạo Supabase client từ createClient trong server.ts
export async function getSupabaseClient() {
  const supabaseClient = await createClient(); // await vì createClient trả về Promise
  return supabaseClient;
}

// Fetch shop settings
export async function getShopSettings(): Promise<ShopSettings> {
  const supabase = await getSupabaseClient(); // Sử dụng supabase client đã tạo từ createClient

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
