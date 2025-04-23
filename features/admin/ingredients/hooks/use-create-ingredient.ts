"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface CreateIngredientParams {
  name: string;
  description?: string | null;
}

export function useCreateIngredient() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (data: CreateIngredientParams) => {
      const { data: result, error } = await supabase
        .from("ingredients")
        .insert(data)
        .select();

      if (error) {
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch ingredients list query
      queryClient.invalidateQueries({ queryKey: ["ingredients", "list"] });
    },
    onError: (error) => {
      console.error("Error creating ingredient:", error);
    },
  });
}
