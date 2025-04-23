"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface DeletePerfumeTypeParams {
  id: number;
}

export function useDeletePerfumeType() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async ({ id }: DeletePerfumeTypeParams) => {
      const { error } = await supabase
        .from("perfume_types")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      return { success: true, id };
    },
    onSuccess: () => {
      // Invalidate and refetch perfume types list query
      queryClient.invalidateQueries({ queryKey: ["perfume_types", "list"] });
    },
    onError: (error) => {
      console.error("Error deleting perfume type:", error);
    },
  });
}
