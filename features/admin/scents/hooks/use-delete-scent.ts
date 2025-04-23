"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface DeleteScentParams {
  id: number;
}

export function useDeleteScent() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async ({ id }: DeleteScentParams) => {
      const { error } = await supabase.from("scents").delete().eq("id", id);

      if (error) {
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      // Invalidate and refetch scents list query
      queryClient.invalidateQueries({ queryKey: ["scents", "list"] });
    },
    onError: (error) => {
      console.error("Error deleting scent:", error);
    },
  });
}
