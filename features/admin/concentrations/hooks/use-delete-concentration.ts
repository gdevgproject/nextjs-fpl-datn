"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface DeleteConcentrationParams {
  id: number;
}

export function useDeleteConcentration() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async ({ id }: DeleteConcentrationParams) => {
      const { error } = await supabase
        .from("concentrations")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      return { success: true, id };
    },
    onSuccess: () => {
      // Invalidate and refetch concentrations list query
      queryClient.invalidateQueries({ queryKey: ["concentrations", "list"] });
    },
    onError: (error) => {
      console.error("Error deleting concentration:", error);
    },
  });
}
