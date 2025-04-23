"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface CreateProductLabelParams {
  name: string;
  color_code?: string | null;
}

export function useCreateProductLabel() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (data: CreateProductLabelParams) => {
      const { data: result, error } = await supabase
        .from("product_labels")
        .insert(data)
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
      console.error("Error creating product label:", error);
    },
  });
}
