"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAssignShipper() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: number;
      assigned_shipper_id: string | null;
    }) => {
      const { data: result, error } = await supabase
        .from("orders")
        .update({ assigned_shipper_id: data.assigned_shipper_id })
        .eq("id", id)
        .select();

      if (error) {
        console.error("Error assigning shipper:", error);
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate related queries to trigger refetches
      queryClient.invalidateQueries({ queryKey: ["orders", "list"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "details"] });
    },
  });
}
