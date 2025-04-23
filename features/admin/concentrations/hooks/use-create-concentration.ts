"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface CreateConcentrationParams {
  name: string;
  description?: string | null;
}

export function useCreateConcentration() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (data: CreateConcentrationParams) => {
      const { data: result, error } = await supabase
        .from("concentrations")
        .insert(data)
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
      console.error("Error creating concentration:", error);
    },
  });
}
