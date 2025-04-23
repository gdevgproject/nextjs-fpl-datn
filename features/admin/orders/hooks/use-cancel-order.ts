"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCancelOrder() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (params: any) => {
      const { data, error } = await supabase.rpc(
        "cancel_order_by_admin",
        params
      );

      if (error) {
        console.error("Error cancelling order:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate queries to refetch the data
      queryClient.invalidateQueries({ queryKey: ["orders", "list"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "details"] });
    },
  });
}
