"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function useCreateScent() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (data: { name: string; description?: string | null }) => {
      const { data: result, error } = await supabase
        .from("scents")
        .insert(data)
        .select();

      if (error) {
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch scents list query
      queryClient.invalidateQueries({ queryKey: ["scents", "list"] });
    },
    onError: (error) => {
      console.error("Error creating scent:", error);
    },
  });
}
