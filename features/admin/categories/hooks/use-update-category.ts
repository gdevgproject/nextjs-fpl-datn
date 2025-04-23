"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface UpdateCategoryParams {
  id: number;
  name?: string;
  description?: string | null;
  image_url?: string | null;
  is_featured?: boolean;
  display_order?: number;
  parent_category_id?: number | null;
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateCategoryParams) => {
      const { data: result, error } = await supabase
        .from("categories")
        .update(data)
        .eq("id", id)
        .select();

      if (error) {
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch categories list query
      queryClient.invalidateQueries({ queryKey: ["categories", "list"] });
    },
    onError: (error) => {
      console.error("Error updating category:", error);
    },
  });
}
