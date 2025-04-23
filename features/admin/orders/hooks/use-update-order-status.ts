"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: { order_status_id: number };
    }) => {
      const { data: result, error } = await supabase
        .from("orders")
        .update(data)
        .eq("id", id)
        .select();

      if (error) {
        console.error("Error updating order status:", error);
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
