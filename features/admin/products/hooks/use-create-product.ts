"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProductAction } from "../actions";
import { productSchema } from "../types";
import { z } from "zod";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

  return useMutation({
    mutationFn: async (payload: z.infer<typeof productSchema>) => {
      if (!payload) {
        throw new Error(
          "Dữ liệu sản phẩm không hợp lệ: Form dữ liệu là bắt buộc"
        );
      }

      // Ensure payload is valid according to the schema before sending to server
      try {
        // Client-side validation for extra safety
        const validated = productSchema.parse(payload);

        // Send validated data to server action
        const result = await createProductAction(validated);

        if (!result.success) {
          throw new Error(result.error || "Không thể tạo sản phẩm");
        }

        return result.data;
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(`Lỗi xác thực: ${error.errors[0].message}`);
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate products list query to refetch
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });

      // Show success toast
      toast.success("Thành công", {
        description: "Sản phẩm đã được tạo thành công",
      });
    },
    onError: (error) => {
      console.error("Lỗi khi tạo sản phẩm:", error);

      // Show error toast
      toast.error("Lỗi", {
        description:
          error instanceof Error ? error.message : "Không thể tạo sản phẩm",
      });
    },
  });
}
