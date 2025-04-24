"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PostgrestError } from "@supabase/supabase-js";

const supabase = getSupabaseBrowserClient();

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      try {
        const { data, error } = await supabase
          .from("products")
          .insert(payload)
          .select();

        if (error) {
          throw error;
        }

        return data;
      } catch (error) {
        console.error("Supabase mutation error (insert on products):", error);
        throw error instanceof PostgrestError
          ? error
          : new Error(String(error));
      }
    },
    onSuccess: (data) => {
      // Invalidate products list query to refetch
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
    },
    onError: (error) => {
      console.error("Error creating product:", error);
    },
  });
}
