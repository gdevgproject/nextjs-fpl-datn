/**
 * Xử lý lỗi API và trả về thông báo lỗi người dùng thân thiện
 */
export function handleApiError(error: unknown): string {
  console.error("API Error:", error)

  // Xử lý lỗi từ Supabase
  if (typeof error === "object" && error !== null && "message" in error) {
    const errorMessage = (error as Error).message

    // Xử lý các lỗi Supabase phổ biến
    if (errorMessage.includes("Invalid login credentials")) {
      return "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại."
    }

    if (errorMessage.includes("Email not confirmed")) {
      return "Email chưa được xác nhận. Vui lòng kiểm tra hộp thư để xác nhận email."
    }

    if (
      errorMessage.includes("User already registered") ||
      errorMessage.includes("already exists") ||
      errorMessage.includes("already been registered")
    ) {
      return "Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập."
    }

    return errorMessage
  }

  // Xử lý lỗi dạng string
  if (typeof error === "string") {
    return error
  }

  // Lỗi mặc định
  return "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau."
}

/**
 * Xử lý lỗi form validation
 */
export function getFormErrorMessage(error: unknown): string {
  if (typeof error === "string") return error
  return "Vui lòng kiểm tra lại thông tin nhập vào."
}

/**
 * Tạo error response chuẩn hóa cho Server Actions
 */
export function createErrorResponse(error: unknown, code?: string) {
  return {
    error: handleApiError(error),
    code,
    success: false,
  }
}

/**
 * Tạo success response chuẩn hóa cho Server Actions
 */
export function createSuccessResponse<T>(data?: T) {
  return {
    success: true,
    data,
  }
}

