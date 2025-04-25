"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProductAction } from "../actions";
import { productSchema } from "../types";
import { z } from "zod";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

  return useMutation({
    mutationFn: async (payload: {
      id: number;
      formData: z.infer<typeof productSchema>;
    }) => {
      const { id, formData } = payload;

      if (!id || !formData) {
        throw new Error("ID sản phẩm và dữ liệu form là bắt buộc");
      }

      try {
        // Client-side validation for extra safety
        const validated = productSchema.parse(formData);

        // Send validated data to server
        const result = await updateProductAction(id, validated);

        if (!result.success) {
          throw new Error(result.error || "Không thể cập nhật sản phẩm");
        }

        return result.data;
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(`Lỗi xác thực: ${error.errors[0].message}`);
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate specific product query
      queryClient.invalidateQueries({
        queryKey: ["products", "byId", variables.id],
      });

      // Also invalidate the list to show updated data
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });

      // Show success toast
      toast.success("Thành công", {
        description: "Sản phẩm đã được cập nhật thành công",
      });
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật sản phẩm:", error);

      // Show error toast
      toast.error("Lỗi", {
        description:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật sản phẩm",
      });
    },
  });
}
