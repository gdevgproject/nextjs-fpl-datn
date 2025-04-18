import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const supabase = getSupabaseBrowserClient();

export function useShopSettings() {
  return useQuery({
    queryKey: ["shop_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_settings")
        .select("*")
        .order("id", { ascending: true })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching shop settings:", error);
        throw error;
      }

      return data;
    },
  });
}
