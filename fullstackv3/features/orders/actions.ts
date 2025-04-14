"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { createErrorResponse, createSuccessResponse } from "@/lib/utils/error-utils"

// Hủy đơn hàng
export async function cancelOrder(orderId: number) {
  const supabase = getSupabaseServerClient()

  try {
    // Lấy thông tin session để kiểm tra user_id
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return createErrorResponse("Bạn cần đăng nhập để thực hiện hành động này", "unauthorized")
    }

    const userId = session.user.id

    // Kiểm tra xem đơn hàng có thuộc về người dùng không
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("id, order_status_id, order_status:order_statuses(name)")
      .eq("id", orderId)
      .eq("user_id", userId)
      .single()

    if (orderError || !orderData) {
      return createErrorResponse("Đơn hàng không tồn tại hoặc không thuộc về bạn", "not_found")
    }

    // Kiểm tra xem đơn hàng có thể hủy không (chỉ hủy được khi đang ở trạng thái Pending hoặc Processing)
    if (orderData.order_status_id !== 1 && orderData.order_status_id !== 2) {
      return createErrorResponse(
        `Không thể hủy đơn hàng ở trạng thái ${orderData.order_status?.name}. Chỉ có thể hủy đơn hàng ở trạng thái Pending hoặc Processing.`,
        "invalid_status",
      )
    }

    // Cập nhật trạng thái đơn hàng thành Cancelled (id = 5)
    const { error: updateError } = await supabase
      .from("orders")
      .update({ order_status_id: 5 })
      .eq("id", orderId)
      .eq("user_id", userId)

    if (updateError) {
      return createErrorResponse(updateError.message)
    }

    // Ghi log hoạt động (nếu cần)
    try {
      await supabase.from("admin_activity_log").insert({
        admin_user_id: null, // Null vì đây là hành động của người dùng
        activity_type: "ORDER_CANCELLED_BY_USER",
        description: `Đơn hàng #${orderId} đã bị hủy bởi người dùng`,
        entity_type: "order",
        entity_id: orderId.toString(),
        details: { cancelled_by_user_id: userId },
      })
    } catch (logError) {
      console.error("Error logging activity:", logError)
      // Không trả về lỗi vì việc ghi log không quan trọng bằng việc hủy đơn hàng
    }

    revalidatePath(`/tai-khoan/don-hang/${orderId}`)
    revalidatePath("/tai-khoan/don-hang")

    return createSuccessResponse({
      message: "Đơn hàng đã được hủy thành công",
      orderId: orderId,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}

