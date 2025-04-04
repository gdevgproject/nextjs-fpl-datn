"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { createErrorResponse, createSuccessResponse } from "@/lib/utils/error-utils"

// Gửi đánh giá sản phẩm
export async function submitProductReview({
  productId,
  rating,
  comment,
}: {
  productId: number
  rating: number
  comment: string
}) {
  const supabase = getSupabaseServerClient()

  try {
    // Kiểm tra session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return createErrorResponse("Bạn cần đăng nhập để đánh giá sản phẩm", "unauthorized")
    }

    const userId = session.user.id

    // Kiểm tra xem người dùng đã mua sản phẩm chưa
    const { data: hasPurchased, error: purchaseError } = await supabase.rpc("has_user_purchased_product", {
      p_product_id: productId,
    })

    if (purchaseError) {
      console.error("Error checking if user purchased product:", purchaseError)
      if (purchaseError.message.includes("Connection timed out")) {
        return createErrorResponse("Không thể kết nối đến cơ sở dữ liệu. Vui lòng thử lại sau.")
      }
      return createErrorResponse("Đã xảy ra lỗi khi kiểm tra lịch sử mua hàng", "purchase_check_failed")
    }

    if (!hasPurchased) {
      return createErrorResponse("Bạn cần mua sản phẩm này trước khi đánh giá", "not_purchased")
    }

    // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
    const { data: existingReview, error: reviewError } = await supabase
      .from("reviews")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .maybeSingle()

    if (reviewError) {
      console.error("Error checking existing review:", reviewError)
      return createErrorResponse("Đã xảy ra lỗi khi kiểm tra đánh giá hiện có", "review_check_failed")
    }

    if (existingReview) {
      // Cập nhật đánh giá hiện có
      const { error: updateError } = await supabase
        .from("reviews")
        .update({
          rating,
          comment,
          is_approved: false, // Đặt lại trạng thái duyệt
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingReview.id)

      if (updateError) {
        console.error("Error updating review:", updateError)
        return createErrorResponse("Đã xảy ra lỗi khi cập nhật đánh giá", "review_update_failed")
      }

      revalidatePath(`/san-pham/${productId}`)
      return createSuccessResponse({ message: "Đánh giá đã được cập nhật và đang chờ duyệt" })
    } else {
      // Tạo đánh giá mới
      const { error: insertError } = await supabase.from("reviews").insert({
        user_id: userId,
        product_id: productId,
        rating,
        comment,
        is_approved: false, // Chờ duyệt
      })

      if (insertError) {
        console.error("Error inserting review:", insertError)
        return createErrorResponse("Đã xảy ra lỗi khi tạo đánh giá", "review_insert_failed")
      }

      revalidatePath(`/san-pham/${productId}`)
      return createSuccessResponse({ message: "Đánh giá đã được gửi và đang chờ duyệt" })
    }
  } catch (error) {
    console.error("Error submitting review:", error)
    return createErrorResponse("Đã xảy ra lỗi khi gửi đánh giá", "review_submission_failed")
  }
}

