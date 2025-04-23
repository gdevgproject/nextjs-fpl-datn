"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDeleteBrandLogo } from "./use-delete-logo";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface DeleteBrandParams {
  id: number;
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();
  const deleteLogoMutation = useDeleteBrandLogo();

  return useMutation({
    mutationFn: async ({ id }: DeleteBrandParams) => {
      try {
        // First, get the brand details to get the logo URL
        const { data: brand, error: fetchError } = await supabase
          .from("brands")
          .select("logo_url")
          .eq("id", id)
          .single();

        if (fetchError) {
          console.error("Error fetching brand before delete:", fetchError);
          // Continue with deletion even if we can't fetch the logo URL
        }

        // Store logo URL for later deletion
        const logoUrl = brand?.logo_url || null;

        // Delete the brand
        const { error } = await supabase.from("brands").delete().eq("id", id);

        if (error) {
          throw error;
        }

        // If the brand had a logo, delete it
        if (logoUrl) {
          try {
            // Use the deleteFromUrl method from useDeleteBrandLogo
            await deleteLogoMutation.deleteFromUrl(logoUrl);
          } catch (error) {
            console.error("Error deleting brand logo:", error);
            // We don't throw here because the brand was already deleted
            // This prevents the UI from freezing due to unhandled errors
          }
        }

        return { success: true, id };
      } catch (error) {
        console.error("Error deleting brand:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch brands list query
      queryClient.invalidateQueries({ queryKey: ["brands", "list"] });
    },
    onError: (error) => {
      console.error("Error in brand deletion process:", error);
    },
  });
}
