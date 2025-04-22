"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Banner, DeleteBannerData } from "../types";
import { deleteBannerAction } from "../actions";

/**
 * Custom hook for deleting banners
 * Uses TanStack Query mutation with server action
 */
export function useDeleteBanner() {
  const queryClient = useQueryClient();

  return useMutation<Banner, Error, DeleteBannerData>({
    mutationFn: async ({ id }: DeleteBannerData) => {
      const result = await deleteBannerAction({ id });

      // Check if there was an error in the server action
      if ("error" in result) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch banners list query
      queryClient.invalidateQueries({ queryKey: ["banners", "list"] });
    },
    onError: (error) => {
      console.error("Error deleting banner:", error);
    },
  });
}
