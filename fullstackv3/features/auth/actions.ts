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
        // Sửa redirect về đúng route xác nhận email
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/(auth)/xac-nhan-email`,
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
    const persistSession = values.rememberMe !== false;
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
      options: { persistSession },
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
