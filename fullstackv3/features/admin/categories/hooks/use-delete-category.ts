"use client";

import { useClientMutation } from "@/shared/hooks/use-client-mutation";
import { useDeleteCategoryImage } from "./use-delete-category-image";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const supabase = getSupabaseBrowserClient();

export function useDeleteCategory() {
  const deleteCategoryMutation = useClientMutation("categories", "delete", {
    invalidateQueries: [["categories", "list"]],
    primaryKey: "id",
  });

  const deleteImageMutation = useDeleteCategoryImage();

  // Extend the mutation to also delete the image
  return {
    ...deleteCategoryMutation,
    mutateAsync: async (variables: any) => {
      try {
        // First, get the category details to get the image URL
        const { data: category, error: fetchError } = await supabase
          .from("categories")
          .select("image_url")
          .eq("id", variables.id)
          .single();

        if (fetchError) {
          console.error("Error fetching category before delete:", fetchError);
          // Continue with deletion even if we can't fetch the image URL
        }

        // Store image URL for later deletion
        const imageUrl = category?.image_url || null;

        // Delete the category
        const result = await deleteCategoryMutation.mutateAsync(variables);

        // If the category had an image, delete it
        if (imageUrl) {
          try {
            // Use the improved deleteFromUrl method
            await deleteImageMutation.deleteFromUrl(imageUrl);
          } catch (error) {
            console.error("Error deleting category image:", error);
            // We don't throw here because the category was already deleted
            // This prevents the UI from freezing due to unhandled errors
          }
        }

        return result;
      } catch (error) {
        // Rethrow the error to be handled by the component
        throw error;
      }
    },
  };
}
