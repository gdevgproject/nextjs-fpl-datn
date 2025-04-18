"use client";

import { useStorageDelete } from "@/shared/hooks/use-client-storage";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const supabase = getSupabaseBrowserClient();

export function useDeleteBannerImage() {
  const deleteStorageMutation = useStorageDelete("banners", {
    invalidateQueryKeys: [["banners", "list"]],
  });

  // Extend mutation to handle errors better and support deletion from URL
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

        return true;
      } catch (error) {
        console.error("Error in deleteFromUrl:", error);
        return false;
      }
    },
  };
}
