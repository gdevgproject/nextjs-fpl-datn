"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase/supabase-server"
import { getSession } from "@/lib/supabase/supabase-server"

interface ProfileData {
  display_name: string
  phone_number: string
  gender?: string
  birth_date?: string
  avatar_url?: string
}

export async function updateProfile(data: ProfileData) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Bạn cần đăng nhập để thực hiện thao tác này" }
    }

    const supabase = createServerSupabaseClient()

    // Chuẩn bị dữ liệu cập nhật
    const updateData: any = {
      display_name: data.display_name,
      phone_number: data.phone_number,
      updated_at: new Date().toISOString(),
    }

    // Thêm các trường tùy chọn nếu có
    if (data.gender) updateData.gender = data.gender
    if (data.birth_date) updateData.birth_date = data.birth_date
    if (data.avatar_url !== undefined) updateData.avatar_url = data.avatar_url

    // Cập nhật profile
    const { error } = await supabase.from("profiles").update(updateData).eq("id", session.user.id)

    if (error) {
      console.error("Error updating profile:", error)
      return { success: false, error: "Không thể cập nhật thông tin tài khoản" }
    }

    // Cập nhật auth.users metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        display_name: data.display_name,
        phone_number: data.phone_number,
      },
    })

    if (authError) {
      console.error("Error updating auth user:", authError)
      // Không return lỗi ở đây vì profile đã được cập nhật thành công
    }

    revalidatePath("/tai-khoan/thong-tin")
    return { success: true }
  } catch (error) {
    console.error("Error in updateProfile:", error)
    return { success: false, error: "Đã xảy ra lỗi khi cập nhật thông tin tài khoản" }
  }
}

export async function uploadAvatar(file: File) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Bạn cần đăng nhập để thực hiện thao tác này" }
    }

    const supabase = createServerSupabaseClient()

    // Tạo tên file duy nhất
    const fileExt = file.name.split(".").pop()
    const fileName = `${session.user.id}-${Date.now()}.${fileExt}`

    // Upload file lên storage
    const { data, error } = await supabase.storage.from("avatars").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Error uploading avatar:", error)
      return { success: false, error: "Không thể tải lên ảnh đại diện" }
    }

    // Lấy URL công khai
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(data.path)

    return { success: true, url: publicUrl }
  } catch (error) {
    console.error("Error in uploadAvatar:", error)
    return { success: false, error: "Đã xảy ra lỗi khi tải lên ảnh đại diện" }
  }
}

