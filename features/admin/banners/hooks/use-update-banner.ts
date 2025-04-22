"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Banner, UpdateBannerData } from "../types";
import { updateBannerAction } from "../actions";

/**
 * Custom hook for updating banners
 * Uses TanStack Query mutation with server action
 */
export function useUpdateBanner() {
  const queryClient = useQueryClient();

  return useMutation<Banner, Error, UpdateBannerData>({
    mutationFn: async (bannerData: UpdateBannerData) => {
      const result = await updateBannerAction(bannerData);

      // Check if there was an error in the server action
      if ("error" in result) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: (data) => {
      // Invalidate and refetch banners list query
      queryClient.invalidateQueries({ queryKey: ["banners", "list"] });

      // If you have individual banner queries, update those too
      queryClient.invalidateQueries({
        queryKey: ["banners", "detail", data.id],
      });
    },
    onError: (error) => {
      console.error("Error updating banner:", error);
    },
  });
}
