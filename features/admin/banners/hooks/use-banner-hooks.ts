"use client";

import {
  createBannerAction,
  updateBannerAction,
  deleteBannerAction,
} from "../actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateBannerData,
  UpdateBannerData,
  DeleteBannerData,
} from "../types";

/**
 * Hook để tạo mới banner
 */
export function useCreateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBannerData) => {
      const result = await createBannerAction(data);

      // Kiểm tra nếu có lỗi từ server action
      if ("error" in result) {
        // Trả về một đối tượng mà không ném lỗi để tránh console error
        return { success: false, error: result.error, data: null };
      }

      return { success: true, data: result, error: null };
    },
    onSuccess: () => {
      // Invalidate banners query để cập nhật UI
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });
}

/**
 * Hook để cập nhật banner
 */
export function useUpdateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateBannerData) => {
      const result = await updateBannerAction(data);

      // Kiểm tra nếu có lỗi từ server action
      if ("error" in result) {
        // Trả về một đối tượng mà không ném lỗi để tránh console error
        return { success: false, error: result.error, data: null };
      }

      return { success: true, data: result, error: null };
    },
    onSuccess: () => {
      // Invalidate banners query để cập nhật UI
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });
}

/**
 * Hook để xóa banner
 */
export function useDeleteBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DeleteBannerData) => {
      const result = await deleteBannerAction(data);

      // Kiểm tra nếu có lỗi từ server action
      if ("error" in result) {
        // Trả về một đối tượng mà không ném lỗi để tránh console error
        return { success: false, error: result.error, data: null };
      }

      return { success: true, data: result, error: null };
    },
    onSuccess: () => {
      // Invalidate banners query để cập nhật UI
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });
}
