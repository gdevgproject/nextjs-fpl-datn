"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface CreateBrandParams {
  name: string;
  description?: string | null;
  logo_url?: string | null;
}

export function useCreateBrand() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (data: CreateBrandParams) => {
      const { data: result, error } = await supabase
        .from("brands")
        .insert(data)
        .select();

      if (error) {
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch brands list query
      queryClient.invalidateQueries({ queryKey: ["brands", "list"] });
    },
    onError: (error) => {
      console.error("Error creating brand:", error);
    },
  });
}
