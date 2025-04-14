import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { login, register, logout, updateProfile, verifyOtp } from "../actions";
import { getSessionClient, getProfileById } from "../services";
import type { LoginFormValues, RegisterFormValues } from "../types";
import type { User, Session } from "@supabase/supabase-js";

// Hook: Đăng nhập
export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: LoginFormValues) => login(values),
    onSuccess: (data) => {
      // Prefetch profile nếu login thành công
      if (data?.data?.user?.id) {
        queryClient.invalidateQueries({
          queryKey: ["profile", data.data.user.id],
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
      if (data?.data?.user?.id) {
        queryClient.invalidateQueries({
          queryKey: ["profile", data.data.user.id],
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
    queryFn: () => (userId ? getProfileById(userId) : null),
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
