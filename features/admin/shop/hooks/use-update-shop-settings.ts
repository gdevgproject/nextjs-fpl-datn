"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateShopSettingsAction } from "../actions";
import { ShopSettingsFormValues, ShopSettings } from "../types";

/**
 * Hook to update shop settings
 * @returns Mutation object for updating shop settings
 */
export function useUpdateShopSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...formData
    }: ShopSettingsFormValues & { id: number }) => {
      return await updateShopSettingsAction(id, formData);
    },
    onSuccess: (data: ShopSettings) => {
      // Update cached data immediately
      queryClient.setQueryData(["shop_settings"], data);
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["shop_settings"] });
    },
  });
}
