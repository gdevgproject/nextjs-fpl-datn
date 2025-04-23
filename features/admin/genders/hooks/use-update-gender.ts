"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface UpdateGenderParams {
  id: number;
  name: string;
  description?: string | null;
}

export function useUpdateGender() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateGenderParams) => {
      const { data: result, error } = await supabase
        .from("genders")
        .update(data)
        .eq("id", id)
        .select();

      if (error) {
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch genders list query
      queryClient.invalidateQueries({ queryKey: ["genders", "list"] });
    },
    onError: (error) => {
      console.error("Error updating gender:", error);
    },
  });
}
