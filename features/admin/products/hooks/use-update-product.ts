"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProductAction } from "../actions";
import { productSchema } from "../types";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { z } from "zod";

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
        throw new Error("Invalid product data: Missing ID or form data");
      }

      // Ensure formData is valid according to the schema before sending to server
      try {
        // Client-side validation for extra safety
        const validated = productSchema.parse(formData);

        // Send validated data to server action
        const result = await updateProductAction(id, validated);

        if (!result.success) {
          throw new Error(result.error || "Failed to update product");
        }

        return result.data;
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(`Validation failed: ${error.errors[0].message}`);
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate specific queries to refetch
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
      if (data?.id) {
        queryClient.invalidateQueries({
          queryKey: ["products", "details", data.id],
        });
      }

      // Show success toast
      toast.success("Success", {
        description: "Product updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating product:", error);

      // Show error toast
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to update product",
      });
    },
  });
}
