"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PostgrestError } from "@supabase/supabase-js";

const supabase = getSupabaseBrowserClient();

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: number; [key: string]: any }) => {
      const { id, ...updateData } = payload;

      try {
        const { data, error } = await supabase
          .from("products")
          .update(updateData)
          .eq("id", id)
          .select();

        if (error) {
          throw error;
        }

        return data;
      } catch (error) {
        console.error("Supabase mutation error (update on products):", error);
        throw error instanceof PostgrestError
          ? error
          : new Error(String(error));
      }
    },
    onSuccess: () => {
      // Invalidate products list query to refetch
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
    },
    onError: (error) => {
      console.error("Error updating product:", error);
    },
  });
}
