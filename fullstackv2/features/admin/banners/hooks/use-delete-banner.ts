"use client"

import { useClientMutation } from "@/shared/hooks/use-client-mutation"
import { useDeleteBannerImage } from "./use-delete-banner-image"
import { createClient } from "@/shared/supabase/client"

const supabase = createClient()

export function useDeleteBanner() {
  const deleteBannerMutation = useClientMutation("banners", "delete", {
    invalidateQueries: [["banners", "list"]],
    primaryKey: "id",
  })

  const deleteImageMutation = useDeleteBannerImage()

  // Extend the mutation to also delete the banner image
  return {
    ...deleteBannerMutation,
    mutateAsync: async (variables: any) => {
      try {
        // First, get the banner details to get the image URL
        const { data: banner, error: fetchError } = await supabase
          .from("banners")
          .select("image_url")
          .eq("id", variables.id)
          .single()

        if (fetchError) {
          console.error("Error fetching banner before delete:", fetchError)
          // Continue with deletion even if we can't fetch the image URL
        }

        // Store image URL for later deletion
        const imageUrl = banner?.image_url || null

        // Delete the banner
        const result = await deleteBannerMutation.mutateAsync(variables)

        // If the banner had an image, delete it
        if (imageUrl) {
          try {
            // Use the improved deleteFromUrl method
            await deleteImageMutation.deleteFromUrl(imageUrl)
          } catch (error) {
            console.error("Error deleting banner image:", error)
            // We don't throw here because the banner was already deleted
          }
        }

        return result
      } catch (error) {
        // Rethrow the error to be handled by the component
        throw error
      }
    },
  }
}
