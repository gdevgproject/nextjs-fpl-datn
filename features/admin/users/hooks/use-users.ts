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

        if (variables.banDuration) {
          switch (variables.banDuration) {
            case "1day":
              message = "Người dùng đã bị chặn trong 1 ngày";
              break;
            case "7days":
              message = "Người dùng đã bị chặn trong 7 ngày";
              break;
            case "30days":
              message = "Người dùng đã bị chặn trong 30 ngày";
              break;
            case "custom":
              if (variables.customDuration) {
                message = `Người dùng đã bị chặn trong ${variables.customDuration} ngày`;
              }
              break;
            default:
              message = "Người dùng đã bị chặn vĩnh viễn";
          }
        }

        toast.success(message, {
          description: data?.data?.bannedUntil
            ? `Chặn đến: ${new Date(data.data.bannedUntil).toLocaleDateString(
                "vi-VN",
                {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}`
            : "Chặn vĩnh viễn",
        });
      } else {
        toast.success("Đã bỏ chặn người dùng", {
          description: "Người dùng có thể đăng nhập lại bình thường",
        });
      }
    },
    onError: (error) => {
      toast.error("Không thể thay đổi trạng thái của người dùng", {
        description: error.message,
      });
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
