"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface UpdatePerfumeTypeParams {
  id: number;
  name: string;
  description?: string | null;
}

export function useUpdatePerfumeType() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdatePerfumeTypeParams) => {
      const { data: result, error } = await supabase
        .from("perfume_types")
        .update(data)
        .eq("id", id)
        .select();

      if (error) {
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch perfume types list query
      queryClient.invalidateQueries({ queryKey: ["perfume_types", "list"] });
    },
    onError: (error) => {
      console.error("Error updating perfume type:", error);
    },
  });
}
