import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/shared/supabase/client"
import { v4 as uuidv4 } from "uuid"

const supabase = createClient()

export function useUploadLogo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      file,
      id,
      oldLogoUrl,
    }: {
      file: File
      id: number
      oldLogoUrl: string | null
    }) => {
      // If there's an old logo, delete it first
      if (oldLogoUrl) {
        try {
          // Extract the file path from the URL
          // The URL format is typically like: https://xxx.supabase.co/storage/v1/object/public/logos/shop/filename.ext
          const urlParts = oldLogoUrl.split("/")
          const bucketName = "logos"

          // Find the index of the bucket name in the URL
          const bucketIndex = urlParts.findIndex((part) => part === bucketName)

          if (bucketIndex !== -1) {
            // Get the path after the bucket name
            const filePath = urlParts.slice(bucketIndex + 1).join("/")

            console.log("Deleting old logo:", filePath)

            // Delete the file from storage
            const { error: deleteError } = await supabase.storage.from(bucketName).remove([filePath])

            if (deleteError) {
              console.warn("Error deleting old logo:", deleteError)
              // Continue with upload even if delete fails
            }
          }
        } catch (error) {
          console.warn("Error processing old logo URL:", error)
          // Continue with upload even if there's an error
        }
      }

      // Generate a unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `shop/${fileName}`

      // Upload the new file
      const { error: uploadError } = await supabase.storage.from("logos").upload(filePath, file)

      if (uploadError) {
        console.error("Error uploading logo:", uploadError)
        throw uploadError
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage.from("logos").getPublicUrl(filePath)

      // Update the shop settings with the new logo URL
      const { data, error: updateError } = await supabase
        .from("shop_settings")
        .update({ shop_logo_url: publicUrlData.publicUrl })
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
