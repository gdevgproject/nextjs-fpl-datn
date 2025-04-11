import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/shared/supabase/client"

const supabase = createClient()

export function useDeleteLogo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, logoUrl }: { id: number; logoUrl: string }) => {
      try {
        // Extract the file path from the URL
        // The URL format is typically like: https://xxx.supabase.co/storage/v1/object/public/logos/shop/filename.ext
        const urlParts = logoUrl.split("/")
        const bucketName = "logos"

        // Find the index of the bucket name in the URL
        const bucketIndex = urlParts.findIndex((part) => part === bucketName)

        if (bucketIndex !== -1) {
          // Get the path after the bucket name
          const filePath = urlParts.slice(bucketIndex + 1).join("/")

          console.log("Deleting logo:", filePath)

          // Delete the file from storage
          const { error: deleteError } = await supabase.storage.from(bucketName).remove([filePath])

          if (deleteError) {
            console.warn("Error deleting logo from storage:", deleteError)
            // Continue with database update even if storage delete fails
          }
        }
      } catch (error) {
        console.warn("Error processing logo URL:", error)
        // Continue with database update even if there's an error
      }

      // Update the shop settings to remove the logo URL
      const { data, error: updateError } = await supabase
        .from("shop_settings")
        .update({ shop_logo_url: null })
        .eq("id", id)
        .select()
        .single()

      if (updateError) {
        console.error("Error updating shop settings:", updateError)
        throw updateError
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop_settings"] })
    },
  })
}
