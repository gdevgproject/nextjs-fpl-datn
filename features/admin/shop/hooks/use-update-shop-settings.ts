import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateShopSettingsAction } from "../actions";
import { ADMIN_SHOP_QUERY_KEYS } from "./use-shop-settings";
import type { ShopSettingsFormValues } from "../types";

export function useUpdateShopSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: number;
      values: ShopSettingsFormValues;
    }) => {
      const result = await updateShopSettingsAction({ id, values });
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_SHOP_QUERY_KEYS.SHOP_SETTINGS,
      });
    },
  });
}
