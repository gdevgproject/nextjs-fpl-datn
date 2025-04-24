"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PostgrestError } from "@supabase/supabase-js";

const supabase = getSupabaseBrowserClient();

// Hook to fetch variants for a specific product
export function useProductVariants(productId: number | null) {
  return useQuery({
    queryKey: ["product_variants", "by_product", productId],
    queryFn: async () => {
      let query = supabase
        .from("product_variants")
        .select(
          "id, product_id, volume_ml, price, sale_price, sku, stock_quantity, deleted_at"
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
        throw error;
      }

      return { data, count };
    },
    enabled: !!productId, // Only fetch if productId is provided
  });
}

// Hook to create a new product variant
export function useCreateProductVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase
        .from("product_variants")
        .insert(payload)
        .select();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate the products list query
      if ("product_id" in variables) {
        queryClient.invalidateQueries({
          queryKey: ["product_variants", "by_product", variables.product_id],
        });
      }
    },
    onError: (error) => {
      console.error("Error creating product variant:", error);
    },
  });
}

// Hook to update an existing product variant
export function useUpdateProductVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: number; [key: string]: any }) => {
      const { id, ...updateData } = payload;

      const { data, error } = await supabase
        .from("product_variants")
        .update(updateData)
        .eq("id", id)
        .select();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      if ("product_id" in variables) {
        queryClient.invalidateQueries({
          queryKey: ["product_variants", "by_product", variables.product_id],
        });
      } else {
        // If we don't have the product_id in the payload, we need to query for it
        const fetchProductId = async () => {
          const { data } = await supabase
            .from("product_variants")
            .select("product_id")
            .eq("id", variables.id)
            .single();

          if (data?.product_id) {
            queryClient.invalidateQueries({
              queryKey: ["product_variants", "by_product", data.product_id],
            });
          } else {
            // Fallback to invalidating all product variant queries
            queryClient.invalidateQueries({
              queryKey: ["product_variants", "by_product"],
            });
          }
        };

        fetchProductId().catch(console.error);
      }
    },
    onError: (error) => {
      console.error("Error updating product variant:", error);
    },
  });
}

// Hook to delete a product variant (soft delete)
export function useDeleteProductVariant() {
  const queryClient = useQueryClient();

  const deleteVariantMutation = useMutation({
    mutationFn: async (payload: { id: number; deleted_at: string | null }) => {
      const { data, error } = await supabase
        .from("product_variants")
        .update({
          deleted_at: payload.deleted_at,
        })
        .eq("id", payload.id)
        .select("id, product_id");

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      if (data?.[0]?.product_id) {
        queryClient.invalidateQueries({
          queryKey: ["product_variants", "by_product", data[0].product_id],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: ["product_variants", "by_product"],
        });
      }
    },
    onError: (error) => {
      console.error("Error updating product variant:", error);
    },
  });

  return {
    ...deleteVariantMutation,
    softDelete: async (variantId: number) => {
      try {
        return await deleteVariantMutation.mutateAsync({
          id: variantId,
          deleted_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error soft deleting product variant:", error);
        throw error;
      }
    },
    restore: async (variantId: number) => {
      try {
        return await deleteVariantMutation.mutateAsync({
          id: variantId,
          deleted_at: null,
        });
      } catch (error) {
        console.error("Error restoring product variant:", error);
        throw error;
      }
    },
  };
}
