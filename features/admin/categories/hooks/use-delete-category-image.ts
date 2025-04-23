"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function useDeleteCategoryImage() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  const mutation = useMutation({
    mutationFn: async (paths: string | string[]) => {
      const pathsArray = Array.isArray(paths) ? paths : [paths];
      if (pathsArray.length === 0) return { data: [] };

      const normalizedPaths = pathsArray.map((p) =>
        p.replace(/\/+/g, "/").replace(/^\/|\/$/g, "")
      );

      const { data, error } = await supabase.storage
        .from("categories")
        .remove(normalizedPaths);

      if (error) throw error;
      return { data };
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["categories", "list"] });
    },
    onError: (error) => {
      console.error(`Storage delete error (bucket: categories):`, error);
    },
  });

  // Return the mutation with an enhanced API
  return {
    ...mutation,
    // Add a method to delete a file from its URL
    deleteFromUrl: async (url: string): Promise<boolean> => {
      try {
        if (!url) return false;

        // Extract the path from URL
        // URL format: https://xxx.supabase.co/storage/v1/object/public/categories/categories/123/image.png
        const urlParts = url.split("/categories/");
        if (urlParts.length <= 1) return false;

        const path = urlParts[1];
        if (!path) return false;

        // Delete the file
        const { error } = await supabase.storage
          .from("categories")
          .remove([path]);

        if (error) {
          console.error("Error deleting image:", error);
          return false;
        }

        // Invalidate queries after manual deletion
        queryClient.invalidateQueries({ queryKey: ["categories", "list"] });
        return true;
      } catch (error) {
        console.error("Error in deleteFromUrl:", error);
        return false;
      }
    },
  };
}
