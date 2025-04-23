"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface AdjustStockParams {
  p_variant_id: number;
  p_change_amount: number;
  p_reason: string;
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (params: AdjustStockParams) => {
      const { data, error } = await supabase.rpc("adjust_stock", {
        p_variant_id: params.p_variant_id,
        p_change_amount: params.p_change_amount,
        p_reason: params.p_reason,
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["inventory", "list"] });
      queryClient.invalidateQueries({ queryKey: ["product_variants", "list"] });
    },
    onError: (error) => {
      console.error("Error adjusting stock:", error);
    },
  });
}
