"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface Brand {
  id: number;
  name: string;
  description: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useBrands = (initialData?: Brand[]) => {
  return useQuery<Brand[]>({
    queryKey: ["brands", "all"],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("brands")
        .select("id, name, logo_url, description")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching brands:", error);
        throw new Error(error.message);
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    initialData,
  });
};
