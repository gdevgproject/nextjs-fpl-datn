"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface CreatePerfumeTypeParams {
  name: string;
  description?: string | null;
}

export function useCreatePerfumeType() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (data: CreatePerfumeTypeParams) => {
      const { data: result, error } = await supabase
        .from("perfume_types")
        .insert(data)
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
      console.error("Error creating perfume type:", error);
    },
  });
}
