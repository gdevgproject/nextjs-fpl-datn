"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function useDeleteBannerImage() {
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();

  const deleteStorageMutation = useMutation({
    mutationFn: async ({ path }: { path: string }) => {
      if (!path) throw new Error("No path provided");

      const { data, error } = await supabase.storage
        .from("banners")
        .remove([path]);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners", "list"] });
    },
  });

  // Return the mutation with an additional method to delete from URL
  return {
    ...deleteStorageMutation,
    // Add method to delete file from URL
    deleteFromUrl: async (url: string): Promise<boolean> => {
      try {
        if (!url) return false;

        // Extract path from URL
        // URL format: https://xxx.supabase.co/storage/v1/object/public/banners/123/image.png
        const urlParts = url.split("/banners/");
        if (urlParts.length <= 1) return false;

        const path = urlParts[1];
        if (!path) return false;

        // Delete file
        const { error } = await supabase.storage.from("banners").remove([path]);

        if (error) {
          console.error("Error deleting banner image:", error);
          return false;
        }

        // Invalidate queries after successful deletion
        queryClient.invalidateQueries({ queryKey: ["banners", "list"] });

        return true;
      } catch (error) {
        console.error("Error in deleteFromUrl:", error);
        return false;
      }
    },
  };
}
