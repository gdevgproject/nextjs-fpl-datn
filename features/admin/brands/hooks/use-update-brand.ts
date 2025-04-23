"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface UpdateBrandParams {
  id: number;
  name: string;
  description?: string | null;
  logo_url?: string | null;
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateBrandParams) => {
      const { data: result, error } = await supabase
        .from("brands")
        .update(data)
        .eq("id", id)
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
      console.error("Error updating brand:", error);
    },
  });
}
