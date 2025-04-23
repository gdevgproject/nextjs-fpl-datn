"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDeleteCategoryImage } from "./use-delete-category-image";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface DeleteCategoryParams {
  id: number;
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();
  const deleteImageMutation = useDeleteCategoryImage();

  return useMutation({
    mutationFn: async ({ id }: DeleteCategoryParams) => {
      try {
        // First, get the category details to get the image URL
        const { data: category, error: fetchError } = await supabase
          .from("categories")
          .select("image_url")
          .eq("id", id)
          .single();

        if (fetchError) {
          console.error("Error fetching category before delete:", fetchError);
          // Continue with deletion even if we can't fetch the image URL
        }

        // Store image URL for later deletion
        const imageUrl = category?.image_url || null;

        // Delete the category
        const { error } = await supabase
          .from("categories")
          .delete()
          .eq("id", id);

        if (error) {
          throw error;
        }

        // If the category had an image, delete it
        if (imageUrl) {
          try {
            // Use the deleteFromUrl method from useDeleteCategoryImage
            await deleteImageMutation.deleteFromUrl(imageUrl);
          } catch (error) {
            console.error("Error deleting category image:", error);
            // We don't throw here because the category was already deleted
            // This prevents the UI from freezing due to unhandled errors
          }
        }

        return { success: true, id };
      } catch (error) {
        console.error("Error deleting category:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch categories list query
      queryClient.invalidateQueries({ queryKey: ["categories", "list"] });
    },
    onError: (error) => {
      console.error("Error in category deletion process:", error);
    },
  });
}
