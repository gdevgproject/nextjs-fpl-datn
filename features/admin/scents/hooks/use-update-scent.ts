"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface UpdateScentParams {
  id: number;
  name: string;
  description?: string | null;
}

export function useUpdateScent() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateScentParams) => {
      const { data: result, error } = await supabase
        .from("scents")
        .update(data)
        .eq("id", id)
        .select();

      if (error) {
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch scents list query
      queryClient.invalidateQueries({ queryKey: ["scents", "list"] });
    },
    onError: (error) => {
      console.error("Error updating scent:", error);
    },
  });
}
