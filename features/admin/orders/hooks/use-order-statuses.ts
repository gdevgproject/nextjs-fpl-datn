"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Hook to fetch order statuses for dropdown selects and filters
 */
export function useOrderStatuses() {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ["order-statuses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_statuses")
        .select("*")
        .order("id", { ascending: true }); // Sắp xếp theo id thay vì display_order không tồn tại

      if (error) {
        console.error("Error fetching order statuses:", error);
        throw new Error(`Error fetching order statuses: ${error.message}`);
      }

      return { data: data || [] };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes since statuses rarely change
  });
}
