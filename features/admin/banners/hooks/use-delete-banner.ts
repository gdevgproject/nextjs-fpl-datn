"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useDeleteBannerImage } from "./use-delete-banner-image";

export function useDeleteBanner() {
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();
  const deleteImageMutation = useDeleteBannerImage();

  const deleteBannerMutation = useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const { data, error } = await supabase
        .from("banners")
        .delete()
        .eq("id", id)
        .select("id")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners", "list"] });
    },
  });

  // Extend the mutation to also delete the banner image
  return {
    ...deleteBannerMutation,
    mutateAsync: async (variables: { id: number }) => {
      try {
        // First, get the banner details to get the image URL
        const { data: banner, error: fetchError } = await supabase
          .from("banners")
          .select("image_url")
          .eq("id", variables.id)
          .single();

        if (fetchError) {
          console.error("Error fetching banner before delete:", fetchError);
          // Continue with deletion even if we can't fetch the image URL
        }

        // Store image URL for later deletion
        const imageUrl = banner?.image_url || null;

        // Delete the banner
        const { mutateAsync } = deleteBannerMutation;
        const result = await mutateAsync(variables);

        // If the banner had an image, delete it
        if (imageUrl) {
          try {
            // Use the improved deleteFromUrl method
            await deleteImageMutation.deleteFromUrl(imageUrl);
          } catch (error) {
            console.error("Error deleting banner image:", error);
            // We don't throw here because the banner was already deleted
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
