"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DeleteBannerImageOptions } from "../types";
import {
  deleteBannerImageAction,
  deleteBannerImageByUrlAction,
} from "../actions";

/**
 * Custom hook for deleting banner images
 * Uses TanStack Query mutation with server actions
 */
export function useDeleteBannerImage() {
  const queryClient = useQueryClient();

  const deleteImageMutation = useMutation<
    string[],
    Error,
    DeleteBannerImageOptions
  >({
    mutationFn: async ({ path }: DeleteBannerImageOptions) => {
      if (!path) {
        throw new Error("No path provided for banner image deletion");
      }

      const result = await deleteBannerImageAction(path);

      // Check if there was an error in the server action
      if ("error" in result) {
        throw new Error(result.error);
      }

      return Array.isArray(result) ? result : [path];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners", "list"] });
    },
    onError: (error) => {
      console.error("Error deleting banner image:", error);
    },
  });

  // Add a helper method to delete by URL
  const deleteFromUrl = async (url: string): Promise<boolean> => {
    if (!url) return false;

    try {
      const result = await deleteBannerImageByUrlAction(url);

      if ("error" in result) {
        console.error("Error deleting banner image:", result.error);
        return false;
      }

      // Invalidate queries after successful deletion
      queryClient.invalidateQueries({ queryKey: ["banners", "list"] });

      return true;
    } catch (error) {
      console.error("Error in deleteFromUrl:", error);
      return false;
    }
  };

  // Return the mutation with the extended deleteFromUrl method
  return {
    ...deleteImageMutation,
    deleteFromUrl,
  };
}
