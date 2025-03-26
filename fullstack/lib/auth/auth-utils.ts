import { createClientSupabaseClient } from "@/lib/supabase/supabase-client"
import { AuthError } from "@supabase/supabase-js"

export function getErrorMessage(error: AuthError | Error | unknown): string {
  if (!error) return "Đã xảy ra lỗi không xác định"

  if (error instanceof AuthError) {
    // Supabase Auth Error
    switch (error.message) {
      case "Invalid login credentials":
        return "Email hoặc mật khẩu không chính xác"
      case "Email not confirmed":
        return "Email chưa được xác nhận. Vui lòng kiểm tra hộp thư của bạn"
      case "User already registered":
        return "Email này đã được đăng ký"
      case "Password should be at least 6 characters":
        return "Mật khẩu phải có ít nhất 6 ký tự"
      case "For security purposes, you can only request this once every 60 seconds":
        return "Vì lý do bảo mật, bạn chỉ có thể yêu cầu một lần mỗi 60 giây"
      case "Invalid reset password token":
        return "Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn"
      default:
        return `Lỗi: ${error.message}`
    }
  }

  if (error instanceof Error) {
    return `Lỗi: ${error.message}`
  }

  return "Đã xảy ra lỗi không xác định"
}

export async function sendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClientSupabaseClient()
    const { error } = await supabase.auth.resendEmailConfirmation({ email })

    if (error) {
      return { success: false, error: getErrorMessage(error) }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const supabase = createClientSupabaseClient()
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    })

    // If there's no error, the email exists
    // If there's an error with message "Email not found", the email doesn't exist
    return !error || error.message !== "Email not found"
  } catch (error) {
    console.error("Error checking if email exists:", error)
    return false
  }
}

