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
        throw new Error("Invalid product data: Form data is required");
      }

      // Ensure payload is valid according to the schema before sending to server
      try {
        // Client-side validation for extra safety
        const validated = productSchema.parse(payload);

        // Send validated data to server action
        const result = await createProductAction(validated);

        if (!result.success) {
          throw new Error(result.error || "Failed to create product");
        }

        return result.data;
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(`Validation failed: ${error.errors[0].message}`);
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate products list query to refetch
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });

      // Show success toast
      toast.success("Success", {
        description: "Product created successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating product:", error);

      // Show error toast
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to create product",
      });
    },
  });
}
