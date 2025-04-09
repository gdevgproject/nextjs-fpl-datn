"use client"

import { useState, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { v4 as uuidv4 } from "uuid"
import { createClient } from "@/shared/supabase/client"
import { useAuth } from "@/features/auth/context/auth-context"
import { toast } from "sonner"

const supabase = createClient()

export function useUploadAvatar() {
  const [isUploading, setIsUploading] = useState(false)
  const queryClient = useQueryClient()
  const { user, refreshUser } = useAuth()
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!user?.id) {
        throw new Error("User not authenticated")
      }

      setIsUploading(true)
      const controller = new AbortController()
      setAbortController(controller)

      try {
        // Get file extension
        const fileExt = file.name.split(".").pop()
        // Create a unique file name
        const fileName = `${uuidv4()}.${fileExt}`
        // Create the file path following the convention in db.txt
        const filePath = `${user.id}/${fileName}`

        // First, check if user already has an avatar
        const { data: profileData } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).single()

        // Upload the new avatar
        const { data: uploadData, error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          signal: controller.signal,
        })

        if (uploadError) {
          throw uploadError
        }

        // Get the public URL of the uploaded file
        const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(filePath)

        if (!publicUrlData?.publicUrl) {
          throw new Error("Failed to get public URL")
        }

        // Update the profile with the new avatar URL
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ avatar_url: publicUrlData.publicUrl })
          .eq("id", user.id)

        if (updateError) {
          throw updateError
        }

        // Update user metadata with the new avatar URL
        await supabase.auth.updateUser({
          data: { avatar_url: publicUrlData.publicUrl },
        })

        // If user had a previous avatar, delete it to save storage
        if (profileData?.avatar_url) {
          // Extract the file path from the URL
          const oldAvatarPath = profileData.avatar_url.split("/avatars/")[1]
          if (oldAvatarPath) {
            // Delete the old avatar (don't wait for this to complete)
            supabase.storage
              .from("avatars")
              .remove([oldAvatarPath])
              .then(({ error }) => {
                if (error) {
                  console.error("Error deleting old avatar:", error)
                }
              })
          }
        }

        // Refresh user data to update the header
        await refreshUser()

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["profile", user.id] })
        queryClient.invalidateQueries({ queryKey: ["user"] })

        toast.success("Ảnh đại diện đã được cập nhật")
        return publicUrlData.publicUrl
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          toast.info("Đã hủy tải lên ảnh đại diện")
        } else {
          console.error("Error uploading avatar:", error)
          toast.error("Tải lên ảnh đại diện thất bại")
          throw error
        }
      } finally {
        setIsUploading(false)
        setAbortController(null)
      }
    },
    [user, queryClient, refreshUser],
  )

  const cancelUpload = useCallback(() => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
      setIsUploading(false)
    }
  }, [abortController])

  return {
    uploadAvatar,
    isUploading,
    cancelUpload,
  }
}
