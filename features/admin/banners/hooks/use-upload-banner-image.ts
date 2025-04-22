"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UploadBannerImageOptions, UploadBannerImageResult } from "../types";
import { uploadBannerImageAction } from "../actions";

/**
 * Custom hook for uploading banner images
 * Uses TanStack Query mutation with server action
 */
export function useUploadBannerImage() {
  const queryClient = useQueryClient();

  return useMutation<UploadBannerImageResult, Error, UploadBannerImageOptions>({
    mutationFn: async ({
      file,
      path,
      fileOptions = {},
      createPathOptions = {},
    }: UploadBannerImageOptions) => {
      if (!file) {
        throw new Error("No file provided");
      }

      // Extract bannerId from path if it exists
      let bannerId: number | undefined;
      if (path) {
        const match = path.match(/^(\d+)\//);
        if (match && match[1]) {
          bannerId = parseInt(match[1], 10);
        }
      }

      const result = await uploadBannerImageAction(file, path, {
        contentType: fileOptions?.contentType,
        upsert: fileOptions?.upsert,
        bannerId,
      });

      // Check if there was an error in the server action
      if ("error" in result) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch banner queries
      queryClient.invalidateQueries({ queryKey: ["banners", "list"] });
    },
    onError: (error) => {
      console.error("Error uploading banner image:", error);
    },
  });
}
