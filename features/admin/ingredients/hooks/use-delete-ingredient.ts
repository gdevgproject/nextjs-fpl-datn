"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface DeleteIngredientParams {
  id: number;
}

export function useDeleteIngredient() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async ({ id }: DeleteIngredientParams) => {
      const { error } = await supabase
        .from("ingredients")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      return { success: true, id };
    },
    onSuccess: () => {
      // Invalidate and refetch ingredients list query
      queryClient.invalidateQueries({ queryKey: ["ingredients", "list"] });
    },
    onError: (error) => {
      console.error("Error deleting ingredient:", error);
    },
  });
}
