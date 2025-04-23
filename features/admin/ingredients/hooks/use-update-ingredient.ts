"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface UpdateIngredientParams {
  id: number;
  name: string;
  description?: string | null;
}

export function useUpdateIngredient() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateIngredientParams) => {
      const { data: result, error } = await supabase
        .from("ingredients")
        .update(data)
        .eq("id", id)
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
      console.error("Error updating ingredient:", error);
    },
  });
}
