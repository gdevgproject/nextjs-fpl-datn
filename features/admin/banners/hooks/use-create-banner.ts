"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Banner, CreateBannerData } from "../types";
import { createBannerAction } from "../actions";

/**
 * Custom hook for creating banners
 * Uses TanStack Query mutation with server action
 */
export function useCreateBanner() {
  const queryClient = useQueryClient();

  return useMutation<Banner, Error, CreateBannerData>({
    mutationFn: async (bannerData: CreateBannerData) => {
      const result = await createBannerAction(bannerData);

      // Check if there was an error in the server action
      if ("error" in result) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch banners list query for automatic UI updates
      queryClient.invalidateQueries({ queryKey: ["banners", "list"] });
    },
    onError: (error) => {
      console.error("Error creating banner:", error);
    },
  });
}
