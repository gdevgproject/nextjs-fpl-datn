import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  login,
  register,
  logout,
  updateProfile,
  verifyOtp,
  forgotPassword,
  resetPassword,
} from "../actions";
import {
  getSessionClient,
  getProfileById,
  getProfileByIdClient,
} from "../services";
import type { LoginFormValues, RegisterFormValues } from "../types";
import type { User, Session } from "@supabase/supabase-js";

// Helper: Lấy data an toàn từ kết quả trả về
export function getResultData<T = any>(result: any): T | undefined {
  if (result && typeof result === "object" && "data" in result) {
    return result.data as T;
  }
  return undefined;
}

// Helper: Lấy error và code an toàn từ kết quả trả về
export function getErrorAndCodeFromResult(result: any): {
  error?: string;
  code?: string;
} {
  if (result && typeof result === "object") {
    if ("error" in result) {
      return { error: result.error, code: result.code };
    }
  }
  return {};
}

// Hook: Đăng nhập
export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: LoginFormValues) => login(values),
    onSuccess: (data) => {
      // Prefetch profile nếu login thành công
      const userData = getResultData(data);
      if (userData?.user?.id) {
        queryClient.invalidateQueries({
          queryKey: ["profile", userData.user.id],
        });
      }
    },
  });
}

// Hook: Đăng ký
export function useRegisterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: RegisterFormValues) => register(values),
    onSuccess: (data) => {
      const userData = getResultData(data);
      if (userData?.user?.id) {
        queryClient.invalidateQueries({
          queryKey: ["profile", userData.user.id],
        });
      }
    },
  });
}

// Hook: Đăng xuất
export function useLogoutMutation() {
  return useMutation({
    mutationFn: () => logout(),
  });
}

// Hook: Lấy session phía client
export function useAuthQuery() {
  return useQuery<Session | null>({
    queryKey: ["auth-session"],
    queryFn: getSessionClient,
    staleTime: 1000 * 60 * 5,
  });
}

// Hook: Lấy profile theo userId
export function useProfileQuery(userId?: string) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => (userId ? getProfileByIdClient(userId) : null),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

// Hook: Cập nhật profile
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<any> }) =>
      updateProfile(userId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["profile", variables.userId],
      });
    },
  });
}

// Hook: Xác nhận email
export function useVerifyOtpMutation() {
  return useMutation({
    mutationFn: (token: string) => verifyOtp(token),
  });
}

// Hook gửi email quên mật khẩu
export function useForgotPasswordMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
  });
}

// Hook đặt lại mật khẩu
export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      resetPassword(token, password),
  });
}
