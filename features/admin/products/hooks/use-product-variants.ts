"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductVariant, productVariantSchema } from "../types";
import {
  createProductVariantAction,
  updateProductVariantAction,
} from "../actions";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { z } from "zod";

const supabase = getSupabaseBrowserClient();

/**
 * Hook to fetch variants for a specific product
 */
export function useProductVariants(productId: number | null) {
  return useQuery<{ data: ProductVariant[]; count: number | null }, Error>({
    queryKey: ["product_variants", "by_product", productId],
    queryFn: async () => {
      let query = supabase
        .from("product_variants")
        .select(
          "id, product_id, volume_ml, price, sale_price, sku, stock_quantity, deleted_at, created_at, updated_at"
        );

      if (productId) {
        query = query
          .eq("product_id", productId)
          .is("deleted_at", null)
          .order("volume_ml", { ascending: true });
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching product variants:", error);
        throw new Error(error.message || "Failed to fetch product variants");
      }

      return { data: data as ProductVariant[], count };
    },
    enabled: !!productId, // Only fetch if productId is provided
  });
}

/**
 * Hook to create a new product variant
 */
export function useCreateProductVariant() {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

  return useMutation({
    mutationFn: async (payload: {
      productId: number;
      data: z.infer<typeof productVariantSchema>;
    }) => {
      const { productId, data } = payload;

      if (!productId || !data) {
        throw new Error(
          "Invalid variant data: Missing product ID or form data"
        );
      }

      // Validate data with schema before sending to server
      try {
        // Client-side validation for extra safety
        const validated = productVariantSchema.parse(data);

        // Send validated data to server action
        const result = await createProductVariantAction(productId, validated);

        if (!result.success) {
          throw new Error(result.error || "Failed to create product variant");
        }

        return result.data;
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(`Validation failed: ${error.errors[0].message}`);
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["product_variants", "by_product", variables.productId],
      });

      toast.success("Success", {
        description: "Product variant created successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating product variant:", error);

      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to create product variant",
      });
    },
  });
}

/**
 * Hook to update an existing product variant
 */
export function useUpdateProductVariant() {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

  return useMutation({
    mutationFn: async (payload: {
      id: number;
      productId: number;
      data: z.infer<typeof productVariantSchema>;
    }) => {
      const { id, productId, data } = payload;

      if (!id || !productId || !data) {
        throw new Error(
          "Invalid variant data: Missing ID, product ID, or form data"
        );
      }

      // Validate data with schema before sending to server
      try {
        // Client-side validation for extra safety
        const validated = productVariantSchema.parse(data);

        // Send validated data to server action
        const result = await updateProductVariantAction(
          id,
          productId,
          validated
        );

        if (!result.success) {
          throw new Error(result.error || "Failed to update product variant");
        }

        return result.data;
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(`Validation failed: ${error.errors[0].message}`);
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["product_variants", "by_product", variables.productId],
      });

      toast.success("Success", {
        description: "Product variant updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating product variant:", error);

      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to update product variant",
      });
    },
  });
}

/**
 * Hook to delete a product variant (soft delete)
 */
export function useDeleteProductVariant() {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

  // Base mutation for soft delete/restore
  const softDeleteMutation = useMutation({
    mutationFn: async (payload: {
      id: number;
      deleted_at: string | null;
      product_id?: number;
    }) => {
      const { id, deleted_at } = payload;

      // If product_id is not provided, fetch it
      let productId = payload.product_id;
      if (!productId) {
        const { data, error } = await supabase
          .from("product_variants")
          .select("product_id")
          .eq("id", id)
          .single();

        if (error) {
          throw new Error(
            error.message || "Failed to fetch product variant information"
          );
        }

        productId = data?.product_id;
      }

      // Update the deleted_at field
      const { data, error } = await supabase
        .from("product_variants")
        .update({ deleted_at })
        .eq("id", id)
        .select("id, product_id");

      if (error) {
        throw new Error(error.message || "Failed to update product variant");
      }

      return { data, productId };
    },
    onSuccess: (result) => {
      // Invalidate queries
      if (result.productId) {
        queryClient.invalidateQueries({
          queryKey: ["product_variants", "by_product", result.productId],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: ["product_variants", "by_product"],
        });
      }
    },
    onError: (error) => {
      console.error("Error updating product variant:", error);
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to update product variant",
      });
    },
  });

  // Return enhanced mutation with specific interfaces
  return {
    ...softDeleteMutation,
    softDelete: async (variantId: number, productId?: number) => {
      try {
        const result = await softDeleteMutation.mutateAsync({
          id: variantId,
          deleted_at: new Date().toISOString(),
          product_id: productId,
        });

        toast.success("Success", {
          description: "Product variant removed successfully",
        });

        return result;
      } catch (error) {
        // Error is already handled in onError
        throw error;
      }
    },
    restore: async (variantId: number, productId?: number) => {
      try {
        const result = await softDeleteMutation.mutateAsync({
          id: variantId,
          deleted_at: null,
          product_id: productId,
        });

        toast.success("Success", {
          description: "Product variant restored successfully",
        });

        return result;
      } catch (error) {
        // Error is already handled in onError
        throw error;
      }
    },
  };
}
