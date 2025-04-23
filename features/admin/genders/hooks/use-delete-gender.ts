"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface DeleteGenderParams {
  id: number;
}

export function useDeleteGender() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async ({ id }: DeleteGenderParams) => {
      const { error } = await supabase.from("genders").delete().eq("id", id);

      if (error) {
        throw error;
      }

      return { success: true, id };
    },
    onSuccess: () => {
      // Invalidate and refetch genders list query
      queryClient.invalidateQueries({ queryKey: ["genders", "list"] });
    },
    onError: (error) => {
      console.error("Error deleting gender:", error);
    },
  });
}
