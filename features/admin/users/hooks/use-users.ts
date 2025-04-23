"use client";

import { useState, useTransition } from "react";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
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
  UserExtended
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
  
  // Use isPending from useTransition to manage UI during state updates
  const [isPending, startTransition] = useTransition();

  const queryClient = useQueryClient();

  // Query for fetching users with more aggressive caching
  const usersQuery = useQuery({
    queryKey: ["admin", "users", filter],
    queryFn: () => fetchUsers(filter),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData, // Keep showing old data while fetching new
  });

  // Update filter function with transitions for smoother UI updates
  const updateFilter = (newFilter: Partial<UserFilter>) => {
    startTransition(() => {
      const isPageReset = 
        newFilter.search !== undefined ||
        newFilter.role !== undefined ||
        newFilter.status !== undefined;

      setFilter((prev) => ({
        ...prev,
        ...newFilter,
        // Reset to page 1 if search, role, or status changes
        ...(isPageReset ? { page: 1 } : {}),
      }));
      
      // Prefetch next page if changing to a new page
      if (newFilter.page && newFilter.page > filter.page) {
        const nextPageFilter = {
          ...filter,
          ...newFilter,
          page: (newFilter.page || filter.page) + 1,
        };
        queryClient.prefetchQuery({
          queryKey: ["admin", "users", nextPageFilter],
          queryFn: () => fetchUsers(nextPageFilter),
        });
      }
    });
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
    isPendingTransition: isPending,
    refetch: usersQuery.refetch,
    // Expose query status for better UI feedback
    status: usersQuery.status,
    isFetching: usersQuery.isFetching,
  };
}

/**
 * Hook for fetching a single user's details with optimizations
 */
export function useUserDetails(userId: string) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ["admin", "user", userId],
    queryFn: () => fetchUserDetails(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    enabled: !!userId,
    placeholderData: () => {
      // Try to get the user from the existing users list cache
      const usersCache = queryClient.getQueriesData<{users: UserExtended[]}>({
        queryKey: ["admin", "users"]
      });
      
      // Find user in any cached users list
      if (usersCache && usersCache.length > 0) {
        for (const [_, data] of usersCache) {
          if (!data || !data.users) continue;
          const cachedUser = data.users.find(user => user.id === userId);
          if (cachedUser) {
            // Return a simple placeholder with minimal data
            return {
              ...cachedUser,
              // Add placeholder data for tabs that will be loaded later
              addresses: [],
              orders: [],
              reviews: [],
              wishlists: []
            };
          }
        }
      }
      return undefined;
    }
  });
}

// Rest of the hooks with optimized mutations

/**
 * Hook for updating user role with optimistic updates
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
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["admin", "user", variables.userId] });
      
      // Snapshot previous value
      const previousUserDetails = queryClient.getQueryData(["admin", "user", variables.userId]);
      
      // Optimistically update user role
      queryClient.setQueryData(
        ["admin", "user", variables.userId], 
        (old: any) => old ? {...old, role: variables.role} : old
      );
      
      // Also update if present in the users list
      queryClient.setQueriesData(
        {queryKey: ["admin", "users"]},
        (data: any) => {
          if (!data?.users) return data;
          return {
            ...data,
            users: data.users.map((user: any) => 
              user.id === variables.userId 
                ? {...user, role: variables.role} 
                : user
            )
          };
        }
      );
      
      return { previousUserDetails };
    },
    onError: (error, variables, context) => {
      // Revert to previous value on error
      if (context?.previousUserDetails) {
        queryClient.setQueryData(
          ["admin", "user", variables.userId], 
          context.previousUserDetails
        );
      }
      toast.error("Không thể cập nhật vai trò người dùng", {
        description: error.message,
      });
    },
    onSuccess: (_, variables) => {
      toast.success(
        `Vai trò người dùng đã được cập nhật thành ${variables.role}`
      );
    },
    onSettled: (_, __, variables) => {
      // Always invalidate to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "user", variables.userId],
      });
    },
  });
}

/**
 * Hook for updating user block status with optimistic updates
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
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["admin", "user", variables.userId] });
      
      // Snapshot previous value
      const previousUserDetails = queryClient.getQueryData(["admin", "user", variables.userId]);
      
      // Optimistically update block status
      queryClient.setQueryData(
        ["admin", "user", variables.userId], 
        (old: any) => old ? {...old, is_blocked: variables.isBlocked} : old
      );
      
      // Also update if present in the users list
      queryClient.setQueriesData(
        {queryKey: ["admin", "users"]},
        (data: any) => {
          if (!data?.users) return data;
          return {
            ...data,
            users: data.users.map((user: any) => 
              user.id === variables.userId 
                ? {...user, is_blocked: variables.isBlocked} 
                : user
            )
          };
        }
      );
      
      return { previousUserDetails };
    },
    onError: (error, variables, context) => {
      // Revert to previous value on error
      if (context?.previousUserDetails) {
        queryClient.setQueryData(
          ["admin", "user", variables.userId], 
          context.previousUserDetails
        );
      }
      
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
    onSuccess: (data, variables) => {
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
    onSettled: (_, __, variables) => {
      // Always invalidate to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "user", variables.userId],
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
