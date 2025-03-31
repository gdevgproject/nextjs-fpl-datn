"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
import { validateEmail, validatePassword, validateDisplayName, validatePhoneNumber } from "@/lib/auth/auth-utils"

/**
 * Signs up a new user with email and password
 */
export async function signUp(email: string, password: string, metadata?: { [key: string]: any }) {
  try {
    // Validate inputs
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return { success: false, error: emailValidation.error }
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.errors[0] }
    }

    // Validate metadata if provided
    if (metadata) {
      if (metadata.display_name) {
        const displayNameValidation = validateDisplayName(metadata.display_name)
        if (!displayNameValidation.isValid) {
          return { success: false, error: displayNameValidation.error }
        }
      }

      if (metadata.phone_number) {
        const phoneValidation = validatePhoneNumber(metadata.phone_number)
        if (!phoneValidation.isValid) {
          return { success: false, error: phoneValidation.error }
        }
      }
    }

    // Create Supabase client
    const supabase = createServerActionClient<Database>({ cookies })

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        data: metadata,
      },
    })

    if (error) {
      console.error("Sign up error:", error)
      return {
        success: false,
        error: formatAuthError(error.message),
      }
    }

    return {
      success: true,
      data,
      error: null,
    }
  } catch (error) {
    console.error("Unexpected sign up error:", error)
    return {
      success: false,
      error: "Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại sau.",
    }
  }
}

/**
 * Signs in a user with email and password
 */
export async function signIn(email: string, password: string, rememberMe = false) {
  try {
    // Validate inputs
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return { success: false, error: emailValidation.error }
    }

    if (!password) {
      return { success: false, error: "Mật khẩu không được để trống" }
    }

    // Create Supabase client
    const supabase = createServerActionClient<Database>({ cookies })

    // Sign in the user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        // Set session expiry based on remember me option
        // Default is 1 hour, extended to 30 days if remember me is checked
        expiresIn: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60,
      },
    })

    if (error) {
      console.error("Sign in error:", error)
      return {
        success: false,
        error: formatAuthError(error.message),
      }
    }

    return {
      success: true,
      data,
      error: null,
    }
  } catch (error) {
    console.error("Unexpected sign in error:", error)
    return {
      success: false,
      error: "Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại sau.",
    }
  }
}

/**
 * Signs in a user with magic link
 */
export async function signInWithMagicLink(email: string) {
  try {
    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return { success: false, error: emailValidation.error }
    }

    // Create Supabase client
    const supabase = createServerActionClient<Database>({ cookies })

    // Send magic link
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      console.error("Magic link error:", error)
      return {
        success: false,
        error: formatAuthError(error.message),
      }
    }

    return {
      success: true,
      data,
      error: null,
    }
  } catch (error) {
    console.error("Unexpected magic link error:", error)
    return {
      success: false,
      error: "Đã xảy ra lỗi khi gửi liên kết đăng nhập. Vui lòng thử lại sau.",
    }
  }
}

/**
 * Sends a password reset email
 */
export async function resetPassword(email: string) {
  try {
    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return { success: false, error: emailValidation.error }
    }

    // Create Supabase client
    const supabase = createServerActionClient<Database>({ cookies })

    // Send password reset email
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/dat-lai-mat-khau`,
    })

    if (error) {
      console.error("Password reset error:", error)
      return {
        success: false,
        error: formatAuthError(error.message),
      }
    }

    return {
      success: true,
      data,
      error: null,
    }
  } catch (error) {
    console.error("Unexpected password reset error:", error)
    return {
      success: false,
      error: "Đã xảy ra lỗi khi gửi email đặt lại mật khẩu. Vui lòng thử lại sau.",
    }
  }
}

/**
 * Updates user password
 */
export async function updatePassword(password: string) {
  try {
    // Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.errors[0] }
    }

    // Create Supabase client
    const supabase = createServerActionClient<Database>({ cookies })

    // Update password
    const { data, error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      console.error("Update password error:", error)
      return {
        success: false,
        error: formatAuthError(error.message),
      }
    }

    return {
      success: true,
      data,
      error: null,
    }
  } catch (error) {
    console.error("Unexpected update password error:", error)
    return {
      success: false,
      error: "Đã xảy ra lỗi khi cập nhật mật khẩu. Vui lòng thử lại sau.",
    }
  }
}

/**
 * Signs out the current user
 */
export async function signOut() {
  try {
    const supabase = createServerActionClient<Database>({ cookies })

    // Clear all cookies first
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    allCookies.forEach((cookie) => {
      if (cookie.name.includes("supabase") || cookie.name.includes("sb-")) {
        cookies().delete(cookie.name)
      }
    })

    // Then call Supabase signOut
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Sign out error:", error)
      return { success: false, error: formatAuthError(error.message) }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Unexpected sign out error:", error)
    return {
      success: false,
      error: "Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại sau.",
    }
  }
}

/**
 * Resends verification email
 */
export async function resendVerificationEmail(email: string) {
  try {
    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return { success: false, error: emailValidation.error }
    }

    // Create Supabase client
    const supabase = createServerActionClient<Database>({ cookies })

    // Send verification email
    const { data, error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      console.error("Resend verification error:", error)
      return {
        success: false,
        error: formatAuthError(error.message),
      }
    }

    return {
      success: true,
      data,
      error: null,
    }
  } catch (error) {
    console.error("Unexpected resend verification error:", error)
    return {
      success: false,
      error: "Đã xảy ra lỗi khi gửi lại email xác nhận. Vui lòng thử lại sau.",
    }
  }
}

/**
 * Checks if the current user is an admin
 */
export async function isAdmin() {
  try {
    const supabase = createServerActionClient<Database>({ cookies })

    // Call the is_admin() RPC function
    const { data, error } = await supabase.rpc("is_admin")

    if (error) {
      console.error("Admin check error:", error)
      return false
    }

    return data
  } catch (error) {
    console.error("Unexpected admin check error:", error)
    return false
  }
}

/**
 * Checks if the current user is a staff member
 */
export async function isStaff() {
  try {
    const supabase = createServerActionClient<Database>({ cookies })

    // Call the is_staff() RPC function
    const { data, error } = await supabase.rpc("is_staff")

    if (error) {
      console.error("Staff check error:", error)
      return false
    }

    return data
  } catch (error) {
    console.error("Unexpected staff check error:", error)
    return false
  }
}

/**
 * Formats auth error messages to be more user-friendly
 */
function formatAuthError(error: string): string {
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

