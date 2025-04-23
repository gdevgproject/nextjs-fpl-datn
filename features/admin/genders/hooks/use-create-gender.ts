"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface CreateGenderParams {
  name: string;
  description?: string | null;
}

export function useCreateGender() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (data: CreateGenderParams) => {
      const { data: result, error } = await supabase
        .from("genders")
        .insert(data)
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
      console.error("Error creating gender:", error);
    },
  });
}
