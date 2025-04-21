"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function useCreateBanner() {
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: any) => {
      const { data, error } = await supabase
        .from("banners")
        .insert(variables)
        .select("id")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch banners list query
      queryClient.invalidateQueries({ queryKey: ["banners", "list"] });
    },
  });
}
