"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUsers, fetchUserDetails } from "../services";
import {
  updateUserRoleAction,
  updateUserBlockStatusAction,
  sendPasswordResetAction,
} from "../actions";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import type {
  UserFilter,
  UpdateUserRole,
  UpdateUserBlockStatus,
} from "../types";

/**
 * Hook for fetching users with filtering and pagination
 */
export function useUsers(initialFilter: Partial<UserFilter> = {}) {
  const [filter, setFilter] = useState<UserFilter>({
    search: "",
    role: "all",
    status: "all",
    page: 1,
    perPage: 10,
    ...initialFilter,
  });

  // Query for fetching users
  const usersQuery = useQuery({
    queryKey: ["admin", "users", filter],
    queryFn: () => fetchUsers(filter),
    staleTime: 1000 * 60, // 1 minute
  });

  // Update filter function
  const updateFilter = (newFilter: Partial<UserFilter>) => {
    setFilter((prev) => ({
      ...prev,
      ...newFilter,
      // Reset to page 1 if search, role, or status changes
      ...(newFilter.search !== undefined ||
      newFilter.role !== undefined ||
      newFilter.status !== undefined
        ? { page: 1 }
        : {}),
    }));
  };

  return {
    users: usersQuery.data?.users || [],
    total: usersQuery.data?.total || 0,
    filteredTotal: usersQuery.data?.filteredTotal || 0,
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,
    filter,
    updateFilter,
    refetch: usersQuery.refetch,
  };
}

/**
 * Hook for fetching a single user's details
 */
export function useUserDetails(userId: string) {
  return useQuery({
    queryKey: ["admin", "user", userId],
    queryFn: () => fetchUserDetails(userId),
    staleTime: 1000 * 60, // 1 minute
    enabled: !!userId,
  });
}

/**
 * Hook for updating user role
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { toast } = useSonnerToast();

  return useMutation({
    mutationFn: async (params: UpdateUserRole) => {
      const result = await updateUserRoleAction(params);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "user", variables.userId],
      });

      toast.success(
        `Vai trò người dùng đã được cập nhật thành ${variables.role}`
      );
    },
    onError: (error) => {
      toast.error("Không thể cập nhật vai trò người dùng", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook for updating user block status
 */
export function useUpdateUserBlockStatus() {
  const queryClient = useQueryClient();
  const { toast } = useSonnerToast();

  return useMutation({
    mutationFn: async (params: UpdateUserBlockStatus) => {
      const result = await updateUserBlockStatusAction(params);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "user", variables.userId],
      });

      // Show appropriate success message based on the action
      if (variables.isBlocked) {
        let message = "Người dùng đã bị chặn";
        let description = "";

        if (variables.banDuration) {
          switch (variables.banDuration) {
            case "1day":
              message = "Chặn người dùng thành công";
              description = "Người dùng đã bị chặn trong 1 ngày";
              break;
            case "7days":
              message = "Chặn người dùng thành công";
              description = "Người dùng đã bị chặn trong 7 ngày";
              break;
            case "30days":
              message = "Chặn người dùng thành công";
              description = "Người dùng đã bị chặn trong 30 ngày";
              break;
            case "custom":
              if (variables.customDuration) {
                message = "Chặn người dùng thành công";
                description = `Người dùng đã bị chặn trong ${variables.customDuration} ngày`;
              }
              break;
            default:
              message = "Chặn người dùng thành công";
              description = "Người dùng đã bị chặn vĩnh viễn";
          }
        }

        if (data?.data?.bannedUntil) {
          description += ` (đến: ${new Date(
            data.data.bannedUntil
          ).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })})`;
        }

        toast.success(message, { description });
      } else {
        toast.success("Bỏ chặn người dùng thành công", {
          description:
            "Người dùng có thể đăng nhập và sử dụng tài khoản bình thường",
        });
      }
    },
    onError: (error) => {
      // Handle specific error messages
      if (error.message.includes("Không thể chặn tài khoản của chính bạn")) {
        toast.error("Không thể tự chặn tài khoản", {
          description: "Bạn không thể chặn tài khoản đang đăng nhập hiện tại",
        });
      } else if (error.message.includes("Không thể chặn tài khoản admin")) {
        toast.error("Không thể chặn tài khoản Admin", {
          description:
            "Việc chặn tài khoản Admin có thể ảnh hưởng nghiêm trọng đến hệ thống",
        });
      } else {
        toast.error("Thao tác không thành công", {
          description:
            error.message || "Đã xảy ra lỗi khi thay đổi trạng thái người dùng",
        });
      }
    },
  });
}

/**
 * Hook for sending password reset email
 */
export function useSendPasswordReset() {
  const { toast } = useSonnerToast();

  return useMutation({
    mutationFn: async (email: string) => {
      const result = await sendPasswordResetAction(email);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Đã gửi email đặt lại mật khẩu");
    },
    onError: (error) => {
      toast.error("Không thể gửi email đặt lại mật khẩu", {
        description: error.message,
      });
    },
  });
}
