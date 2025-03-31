import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Provider } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Create a singleton Supabase client for client components
const supabase = createClientComponentClient<Database>()

/**
 * Validates password strength
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!password) {
    errors.push("Mật khẩu không được để trống")
    return { isValid: false, errors }
  }

  if (password.length < 6) {
    errors.push("Mật khẩu phải có ít nhất 6 ký tự")
  }

  // Additional password strength suggestions (not required)
  if (!/[A-Z]/.test(password)) {
    errors.push("Gợi ý: Nên có ít nhất 1 chữ hoa")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Gợi ý: Nên có ít nhất 1 chữ thường")
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Gợi ý: Nên có ít nhất 1 số")
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Gợi ý: Nên có ít nhất 1 ký tự đặc biệt")
  }

  // Only require minimum length for validity
  return {
    isValid: password.length >= 6,
    errors,
  }
}

/**
 * Validates email format
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || email.trim() === "") {
    return { isValid: false, error: "Email không được để trống" }
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Email không đúng định dạng" }
  }

  return { isValid: true }
}

/**
 * Validates display name
 */
export function validateDisplayName(displayName: string): { isValid: boolean; error?: string } {
  if (!displayName || displayName.trim() === "") {
    return { isValid: false, error: "Tên hiển thị không được để trống" }
  }

  if (displayName.length < 2) {
    return { isValid: false, error: "Tên hiển thị phải có ít nhất 2 ký tự" }
  }

  if (displayName.length > 50) {
    return { isValid: false, error: "Tên hiển thị không được vượt quá 50 ký tự" }
  }

  return { isValid: true }
}

/**
 * Validates phone number format
 */
export function validatePhoneNumber(phoneNumber: string): { isValid: boolean; error?: string } {
  if (!phoneNumber || phoneNumber.trim() === "") {
    return { isValid: false, error: "Số điện thoại không được để trống" }
  }

  // Vietnamese phone number format
  const phoneRegex = /^(0|\+84)(\d{9,10})$/
  if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
    return { isValid: false, error: "Số điện thoại không đúng định dạng" }
  }

  return { isValid: true }
}

/**
 * Extracts error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "object" && error !== null) {
    // Handle Supabase error object
    if ("message" in error && typeof error.message === "string") {
      return error.message
    }

    if ("error" in error && typeof error.error === "string") {
      return error.error
    }

    if ("error_description" in error && typeof error.error_description === "string") {
      return error.error_description
    }
  }

  return "Đã xảy ra lỗi không xác định"
}

/**
 * Checks if an email exists in the auth system
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    })

    // If there's an error about user not found, the email doesn't exist
    if (error && error.message.includes("user not found")) {
      return false
    }

    // If we get here, the email exists (either the OTP was sent or there was another error)
    return true
  } catch (error) {
    console.error("Error checking email existence:", error)
    // Default to false on error to prevent revealing user existence
    return false
  }
}

/**
 * Parses error from URL hash fragment
 */
export function parseHashError(): { errorType: string | null; errorDescription: string | null } {
  if (typeof window === "undefined") {
    return { errorType: null, errorDescription: null }
  }

  const hash = window.location.hash.substring(1)
  const params = new URLSearchParams(hash)

  const errorType = params.get("error")
  const errorDescription = params.get("error_description")

  return { errorType, errorDescription }
}

/**
 * Saves email to localStorage for confirmation resending
 */
export function savePendingConfirmationEmail(email: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("pendingConfirmationEmail", email)
  }
}

/**
 * Gets email from localStorage for confirmation resending
 */
export function getPendingConfirmationEmail(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("pendingConfirmationEmail")
  }
  return null
}

/**
 * Clears email from localStorage after confirmation
 */
export function clearPendingConfirmationEmail(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("pendingConfirmationEmail")
  }
}

/**
 * Saves email to localStorage for password reset
 */
export function savePendingPasswordResetEmail(email: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("pendingPasswordResetEmail", email)
  }
}

/**
 * Gets email from localStorage for password reset
 */
export function getPendingPasswordResetEmail(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("pendingPasswordResetEmail")
  }
  return null
}

/**
 * Clears email from localStorage after password reset
 */
export function clearPendingPasswordResetEmail(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("pendingPasswordResetEmail")
  }
}

/**
 * Handles OAuth sign in with provider
 */
export async function signInWithProvider(provider: Provider) {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      throw error
    }

    return { success: true, data, error: null }
  } catch (error) {
    console.error("OAuth sign in error:", error)
    return { success: false, data: null, error: getErrorMessage(error) }
  }
}

/**
 * Formats auth error messages to be more user-friendly
 */
export function formatAuthError(error: string): string {
  if (!error) return "Đã xảy ra lỗi không xác định"

  // Map common Supabase auth errors to user-friendly messages
  const errorMap: Record<string, string> = {
    "Invalid login credentials": "Email hoặc mật khẩu không chính xác",
    "Email not confirmed": "Email chưa được xác nhận. Vui lòng kiểm tra hộp thư của bạn",
    "User already registered": "Email này đã được đăng ký",
    "Password should be at least 6 characters": "Mật khẩu phải có ít nhất 6 ký tự",
    "For security purposes, you can only request this once every 60 seconds":
      "Vì lý do bảo mật, bạn chỉ có thể yêu cầu một lần mỗi 60 giây",
    "Email rate limit exceeded": "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau",
    "No user found with that email": "Không tìm thấy tài khoản với email này",
    "New password should be different from the old password": "Mật khẩu mới phải khác mật khẩu cũ",
    "Password recovery requires an email": "Vui lòng nhập email để khôi phục mật khẩu",
  }

  // Check if the error message contains any of the keys in the errorMap
  for (const [key, value] of Object.entries(errorMap)) {
    if (error.includes(key)) {
      return value
    }
  }

  return error
}

/**
 * Cleans up the session and cookies on the client side
 * This is a helper function to ensure all auth state is properly cleared
 */
export function cleanupAuthState() {
  // Clear localStorage items related to auth
  const authKeys = ["supabase.auth.token", "supabase.auth.refreshToken"]
  authKeys.forEach((key) => {
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.error(`Error removing ${key} from localStorage:`, e)
    }
  })

  // Clear sessionStorage items related to auth
  try {
    sessionStorage.clear()
  } catch (e) {
    console.error("Error clearing sessionStorage:", e)
  }

  // If you're using any other storage mechanisms, clear those too

  return true
}

