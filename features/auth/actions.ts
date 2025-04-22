"use server";

import type { z } from "zod";
import type { loginSchema, registerSchema } from "./validators";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/utils/error-utils";
import { getProfileById } from "./services";
import {
  getSupabaseServerClient,
  createServiceRoleClient,
} from "@/lib/supabase/server";

// Cập nhật type cho login params
type LoginParams = z.infer<typeof loginSchema> & {
  rememberMe?: boolean;
};

// Đăng ký
export async function register(values: z.infer<typeof registerSchema>) {
  const supabase = await getSupabaseServerClient();

  try {
    // Tiến hành đăng ký
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          display_name: values.display_name,
          phone_number: values.phone_number || null,
        },
        // Sửa redirect về đúng route xác nhận email (không có group route)
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/xac-nhan-email`,
      },
    });

    if (error) {
      if (
        error.message.includes("already registered") ||
        error.message.includes("User already registered") ||
        error.message.includes("already been registered") ||
        error.message.includes("already exists")
      ) {
        return createErrorResponse(
          "Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.",
          "email_taken"
        );
      }
      if (error.message.includes("password")) {
        return createErrorResponse(
          "Mật khẩu không hợp lệ. Vui lòng kiểm tra lại yêu cầu về mật khẩu.",
          "invalid_password"
        );
      }
      return createErrorResponse(error.message);
    }

    if (data?.user && !data.user.email_confirmed_at) {
      return { ...createSuccessResponse(data), emailConfirmation: true };
    }
    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse(error);
  }
}

// Đăng nhập
export async function login(values: LoginParams) {
  const supabase = await getSupabaseServerClient();
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        return createErrorResponse(
          "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại."
        );
      }
      if (error.message.includes("Email not confirmed")) {
        return createErrorResponse(
          "Email chưa được xác nhận. Vui lòng kiểm tra hộp thư để xác nhận email.",
          "email_not_confirmed"
        );
      }
      if (
        error.message.includes("user is banned") ||
        error.code === "user_banned"
      ) {
        // Xác định thời gian khóa nếu có
        const bannedUntilMatch = error.message.match(/banned until (.+)\./);
        const banEndTime = bannedUntilMatch ? bannedUntilMatch[1] : null;

        if (banEndTime) {
          // Nếu có thời hạn khóa
          return createErrorResponse(
            `Tài khoản của bạn đã bị tạm khóa đến ${banEndTime}. Vui lòng liên hệ quản trị viên nếu cần hỗ trợ.`,
            "user_banned"
          );
        } else {
          // Nếu khóa vĩnh viễn
          return createErrorResponse(
            "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.",
            "user_banned"
          );
        }
      }
      return createErrorResponse(error.message);
    }
    // Prefetch profile data để cải thiện hiệu suất
    if (data.user) {
      try {
        const profileData = await getProfileById(data.user.id);
        if (profileData) {
          return createSuccessResponse({
            session: data.session,
            user: data.user,
            profile: profileData,
          });
        }
      } catch (profileError) {
        // Bỏ qua lỗi prefetch
      }
    }
    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse(error);
  }
}

// Đăng xuất
export async function logout() {
  const supabase = await getSupabaseServerClient();
  try {
    await supabase.auth.signOut();
    return { success: true, redirect: "/" };
  } catch (error) {
    return createErrorResponse(error);
  }
}

// Xác nhận email
export async function verifyOtp(token: string) {
  const supabase = await getSupabaseServerClient();
  try {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "email",
    });
    if (error) {
      return createErrorResponse(error.message);
    }
    return createSuccessResponse();
  } catch (error) {
    return createErrorResponse(error);
  }
}

// Cập nhật profile
export async function updateProfile(userId: string, data: Partial<any>) {
  const supabase = await getSupabaseServerClient();
  try {
    const { error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", userId);
    if (error) {
      return createErrorResponse(error.message);
    }
    return createSuccessResponse();
  } catch (error) {
    return createErrorResponse(error);
  }
}

// Quên mật khẩu: gửi email reset password
export async function forgotPassword(email: string) {
  const supabase = await getSupabaseServerClient();
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dat-lai-mat-khau`,
    });
    if (error) return createErrorResponse(error.message);
    return createSuccessResponse();
  } catch (err: any) {
    return createErrorResponse(err.message);
  }
}

// Đặt lại mật khẩu: xác thực token và cập nhật mật khẩu mới
export async function resetPassword(token: string, password: string) {
  const supabase = await getSupabaseServerClient();
  try {
    const { error } = await supabase.auth.verifyOtp({
      token,
      type: "recovery",
      newPassword: password,
    });
    if (error) return createErrorResponse(error.message);
    return createSuccessResponse();
  } catch (err: any) {
    return createErrorResponse(err.message);
  }
}
