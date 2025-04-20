import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadLogoAction } from "../actions";
import { ADMIN_SHOP_QUERY_KEYS } from "./use-shop-settings";

export function useUploadLogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      file: File;
      id: number;
      oldLogoUrl: string | null;
    }) => {
      const result = await uploadLogoAction(input);
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
