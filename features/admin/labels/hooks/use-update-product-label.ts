"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface UpdateProductLabelParams {
  id: number;
  name: string;
  color_code?: string | null;
}

export function useUpdateProductLabel() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateProductLabelParams) => {
      const { data: result, error } = await supabase
        .from("product_labels")
        .update(data)
        .eq("id", id)
        .select();

      if (error) {
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch product labels list query
      queryClient.invalidateQueries({ queryKey: ["product_labels", "list"] });
    },
    onError: (error) => {
      console.error("Error updating product label:", error);
    },
  });
}
