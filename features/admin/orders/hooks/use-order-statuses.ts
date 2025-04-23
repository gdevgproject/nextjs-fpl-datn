"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useOrderStatuses() {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ["order_statuses", "list"],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from("order_statuses")
        .select("id, name, description")
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching order statuses:", error);
        throw error;
      }

      return { data: data || [], count };
    },
  });
}
