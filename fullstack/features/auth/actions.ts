"use server";

import type { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { loginSchema, registerSchema } from "./validators";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/utils/error-utils";

// Cập nhật type cho login params
type LoginParams = z.infer<typeof loginSchema> & {
  rememberMe?: boolean;
};

// Đăng ký
export async function register(values: z.infer<typeof registerSchema>) {
  const supabase = await getSupabaseServerClient();
  const serviceClient = await createServiceRoleClient();

  try {
    // Kiểm tra xem email đã tồn tại chưa
    const { data: existingUser } = await serviceClient
      .from("profiles")
      .select("id")
      .eq(
        "id",
        (
          await serviceClient.auth.admin.listUsers()
        ).data.users.find((u) => u.email === values.email)?.id || ""
      )
      .single();

    if (existingUser) {
      return createErrorResponse(
        "Email này đã được sử dụng. Vui lòng sử dụng email khác hoặc đăng nhập.",
        "email_taken"
      );
    }

    // Tiến hành đăng ký
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          display_name: values.display_name,
          phone_number: values.phone_number || null,
        },
        // Điều hướng đến trang đăng nhập sau khi xác nhận email
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback?type=signup`,
      },
    });

    if (error) {
      // Xử lý lỗi từ Supabase
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

      // Xử lý các lỗi khác
      if (error.message.includes("password")) {
        return createErrorResponse(
          "Mật khẩu không hợp lệ. Vui lòng kiểm tra lại yêu cầu về mật khẩu.",
          "invalid_password"
        );
      }

      return createErrorResponse(error.message);
    }

    // Kiểm tra xem email đã được xác nhận chưa
    if (data?.user && !data.user.email_confirmed_at) {
      return { ...createSuccessResponse(data), emailConfirmation: true };
    }

    return createSuccessResponse(data);
  } catch (error) {
    console.error("Lỗi không xác định trong quá trình đăng ký:", error);
    return createErrorResponse(error);
  }
}

// Cải thiện hàm login để xử lý đăng nhập hiệu quả hơn
export async function login(values: LoginParams) {
  const supabase = await getSupabaseServerClient();

  try {
    // Đảm bảo persistSession luôn được đặt đúng
    const persistSession = values.rememberMe !== false;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
      options: {
        // Nếu rememberMe = true, session sẽ được lưu lâu hơn (30 ngày)
        // Nếu rememberMe = false, session sẽ được lưu trong thời gian ngắn hơn (mặc định là 1 giờ)
        persistSession,
      },
    });

    if (error) {
      // Cung cấp thông báo lỗi thân thiện hơn
      if (error.message.includes("Invalid login credentials")) {
        return createErrorResponse(
          "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại."
        );
      }

      // Kiểm tra xem email đã được xác nhận chưa
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
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        // Trả về cả dữ liệu profile để client có thể sử dụng ngay
        if (!profileError && profileData) {
          return createSuccessResponse({
            session: data.session,
            user: data.user,
            profile: profileData,
          });
        }
      } catch (profileError) {
        // Bỏ qua lỗi prefetch, không ảnh hưởng đến luồng đăng nhập
        console.error("Error prefetching profile:", profileError);
      }
    }

    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse(error);
  }
}

// Đăng xuất - server action
export async function logout() {
  const supabase = await getSupabaseServerClient();

  try {
    // Simply sign out on the server side
    await supabase.auth.signOut();

    // Return success to allow client-side code to handle redirection
    return { success: true, redirect: "/" };
  } catch (error) {
    console.error("Logout error:", error);
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
