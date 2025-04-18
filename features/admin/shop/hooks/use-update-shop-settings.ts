import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const supabase = getSupabaseBrowserClient();

export function useUpdateShopSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shopSettings: { id: number; [key: string]: any }) => {
      const { id, ...updateData } = shopSettings;

      const { data, error } = await supabase
        .from("shop_settings")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating shop settings:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop_settings"] });
    },
  });
}
