"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { createErrorResponse, createSuccessResponse } from "@/lib/utils/error-utils"

// Cập nhật thông tin profile
export async function updateProfileInfo(userId: string, data: any) {
  const supabase = getSupabaseServerClient()

  try {
    const { error } = await supabase.from("profiles").update(data).eq("id", userId)

    if (error) {
      return createErrorResponse(error.message)
    }

    revalidatePath("/tai-khoan")
    return createSuccessResponse()
  } catch (error) {
    return createErrorResponse(error)
  }
}

// Sửa hàm uploadAvatar để xử lý lỗi tốt hơn và trả về kết quả rõ ràng hơn
export async function uploadAvatar(userId: string, file: File) {
  const supabase = getSupabaseServerClient()

  try {
    console.log("Server action: Bắt đầu tải ảnh lên cho user", userId)

    // Lấy thông tin profile hiện tại để kiểm tra avatar_url cũ
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Lỗi khi lấy thông tin profile:", profileError)
      return createErrorResponse(profileError.message)
    }

    // Tạo đường dẫn thư mục theo user_id để tổ chức tốt hơn
    const userFolder = `user_${userId}`

    // Tạo tên file duy nhất với timestamp để tránh trùng lặp
    const timestamp = Date.now()
    const fileExt = file.name.split(".").pop()
    const fileName = `${userFolder}/avatar_${timestamp}.${fileExt}`

    console.log("Tải lên file:", fileName)

    // Upload file lên Supabase Storage
    const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (uploadError) {
      console.error("Lỗi khi tải lên file:", uploadError)
      return createErrorResponse(uploadError.message)
    }

    // Lấy public URL của file đã upload
    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(fileName)

    console.log("URL công khai của file:", publicUrlData.publicUrl)

    // Cập nhật avatar_url trong profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrlData.publicUrl,
      })
      .eq("id", userId)

    if (updateError) {
      console.error("Lỗi khi cập nhật profile:", updateError)
      return createErrorResponse(updateError.message)
    }

    // Xóa ảnh cũ nếu có và không phải ảnh mặc định
    if (profileData?.avatar_url && !profileData.avatar_url.includes("default-avatar")) {
      try {
        // Trích xuất đường dẫn file từ URL
        const oldAvatarUrl = profileData.avatar_url
        const urlParts = oldAvatarUrl.split("avatars/")

        if (urlParts.length > 1) {
          const oldFilePath = urlParts[1]
          console.log("Xóa file cũ:", oldFilePath)
          // Xóa file cũ
          await supabase.storage.from("avatars").remove([oldFilePath])
        }
      } catch (deleteError) {
        console.error("Lỗi khi xóa avatar cũ:", deleteError)
        // Không trả về lỗi vì việc xóa ảnh cũ không quan trọng bằng việc cập nhật ảnh mới
      }
    }

    revalidatePath("/tai-khoan")
    console.log("Tải lên thành công, URL mới:", publicUrlData.publicUrl)
    return createSuccessResponse({ avatarUrl: publicUrlData.publicUrl })
  } catch (error) {
    console.error("Lỗi không xác định khi tải lên avatar:", error)
    return createErrorResponse(error)
  }
}

