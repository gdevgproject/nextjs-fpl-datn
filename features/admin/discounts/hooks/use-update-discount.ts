"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function useUpdateDiscount() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: { id: string | number } & Record<string, any>) => {
      const { data: result, error } = await supabase
        .from("discounts")
        .update(data)
        .eq("id", id)
        .select("id")
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts", "list"] });
    },
  });
}
