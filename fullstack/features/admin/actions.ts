"use server"

import { getSupabaseServiceClient } from "@/lib/supabase/service"
import { createErrorResponse, createSuccessResponse } from "@/lib/utils/error-utils"
import { getUserRoleFromMetadata } from "@/lib/utils/auth-utils"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// Cập nhật role của người dùng (chỉ admin mới có quyền)
export async function updateUserRole(userId: string, newRole: "admin" | "staff" | "authenticated") {
  try {
    // Kiểm tra quyền của người dùng hiện tại
    const supabase = getSupabaseServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return createErrorResponse("Bạn cần đăng nhập để thực hiện hành động này", "unauthorized")
    }

    const currentUserRole = getUserRoleFromMetadata(session.user)

    // Chỉ admin mới có quyền cập nhật role
    if (currentUserRole !== "admin") {
      return createErrorResponse("Bạn không có quyền thực hiện hành động này", "forbidden")
    }

    // Sử dụng service client để cập nhật app_metadata
    const serviceClient = getSupabaseServiceClient()

    // Cập nhật app_metadata của user
    const { error } = await serviceClient.auth.admin.updateUserById(userId, { app_metadata: { role: newRole } })

    if (error) {
      return createErrorResponse(error.message)
    }

    // Cập nhật role trong bảng profiles
    await serviceClient.from("profiles").update({ role: newRole }).eq("id", userId)

    // Ghi log hoạt động
    await serviceClient.from("admin_activity_log").insert({
      admin_user_id: session.user.id,
      activity_type: "USER_ROLE_UPDATE",
      description: `Cập nhật vai trò của người dùng ${userId} thành ${newRole}`,
      entity_type: "user",
      entity_id: userId,
      details: { new_role: newRole },
    })

    return createSuccessResponse({ role: newRole })
  } catch (error) {
    return createErrorResponse(error)
  }
}

