"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/shared/supabase/client"
import { useAuth } from "@/features/auth/context/auth-context"
import type { UpdateProfileData } from "../types"
import { toast } from "sonner"

const supabase = createClient()

export function useUpdateProfile() {
  const [isUpdating, setIsUpdating] = useState(false)
  const queryClient = useQueryClient()
  const { user, refreshUser } = useAuth()

  const updateProfile = async (data: UpdateProfileData) => {
    if (!user?.id) {
      throw new Error("User not authenticated")
    }

    setIsUpdating(true)

    try {
      // Format the data for Supabase
      const updateData: Record<string, any> = { ...data }

      // Format date if it exists
      if (data.birth_date) {
        updateData.birth_date = data.birth_date.toISOString().split("T")[0]
      }

      // Update profile in Supabase
      const { error } = await supabase.from("profiles").update(updateData).eq("id", user.id)

      if (error) {
        throw error
      }

      // Update user metadata if display_name changed
      if (data.display_name) {
        await supabase.auth.updateUser({
          data: { display_name: data.display_name },
        })

        // Refresh user to update the header
        await refreshUser()
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] })
      queryClient.invalidateQueries({ queryKey: ["user"] })

      toast.success("Thông tin tài khoản đã được cập nhật")
      return true
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Cập nhật thông tin thất bại")
      throw error
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    updateProfile,
    isUpdating,
  }
}
