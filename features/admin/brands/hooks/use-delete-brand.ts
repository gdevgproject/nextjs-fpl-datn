"use client";

import { useClientMutation } from "@/shared/hooks/use-client-mutation";
import { useDeleteBrandLogo } from "./use-delete-logo";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const supabase = getSupabaseBrowserClient();

export function useDeleteBrand() {
  const deleteBrandMutation = useClientMutation("brands", "delete", {
    invalidateQueries: [["brands", "list"]],
    primaryKey: "id",
  });

  const deleteLogoMutation = useDeleteBrandLogo();

  // Extend the mutation to also delete the logo
  return {
    ...deleteBrandMutation,
    mutateAsync: async (variables: any) => {
      try {
        // First, get the brand details to get the logo URL
        const { data: brand, error: fetchError } = await supabase
          .from("brands")
          .select("logo_url")
          .eq("id", variables.id)
          .single();

        if (fetchError) {
          console.error("Error fetching brand before delete:", fetchError);
          // Continue with deletion even if we can't fetch the logo URL
        }

        // Store logo URL for later deletion
        const logoUrl = brand?.logo_url || null;

        // Delete the brand
        const result = await deleteBrandMutation.mutateAsync(variables);

        // If the brand had a logo, delete it
        if (logoUrl) {
          try {
            // Use the improved deleteFromUrl method
            await deleteLogoMutation.deleteFromUrl(logoUrl);
          } catch (error) {
            console.error("Error deleting brand logo:", error);
            // We don't throw here because the brand was already deleted
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
