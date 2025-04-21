"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadLogoAction } from "../actions";
import { ShopSettings } from "../types";

/**
 * Interface for logo upload parameters
 */
interface UploadLogoParams {
  file: File;
  id: number;
  oldLogoUrl: string | null;
}

/**
 * Hook to upload shop logo
 * @returns Mutation object for uploading shop logo
 */
export function useUploadLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, id, oldLogoUrl }: UploadLogoParams) => {
      return await uploadLogoAction(id, file, oldLogoUrl);
    },
    onSuccess: (data: ShopSettings) => {
      // Update cached data immediately
      queryClient.setQueryData(["shop_settings"], data);
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["shop_settings"] });
    },
  });
}
