"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface DeleteProductLabelParams {
  id: number;
}

export function useDeleteProductLabel() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async ({ id }: DeleteProductLabelParams) => {
      const { error } = await supabase
        .from("product_labels")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      return { success: true, id };
    },
    onSuccess: () => {
      // Invalidate and refetch product labels list query
      queryClient.invalidateQueries({ queryKey: ["product_labels", "list"] });
    },
    onError: (error) => {
      console.error("Error deleting product label:", error);
    },
  });
}
