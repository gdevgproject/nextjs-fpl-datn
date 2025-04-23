"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface UpdateConcentrationParams {
  id: number;
  name: string;
  description?: string | null;
}

export function useUpdateConcentration() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateConcentrationParams) => {
      const { data: result, error } = await supabase
        .from("concentrations")
        .update(data)
        .eq("id", id)
        .select();

      if (error) {
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch concentrations list query
      queryClient.invalidateQueries({ queryKey: ["concentrations", "list"] });
    },
    onError: (error) => {
      console.error("Error updating concentration:", error);
    },
  });
}
