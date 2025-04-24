"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PostgrestError } from "@supabase/supabase-js";
import { useCallback } from "react";

const supabase = getSupabaseBrowserClient();

// Hook to fetch categories for a specific product
export function useProductCategories(productId: number | null) {
  return useQuery({
    queryKey: ["product_categories", "by_product", productId],
    queryFn: async () => {
      let query = supabase
        .from("product_categories")
        .select(
          "id, product_id, category_id, categories:category_id(id, name)"
        );

      if (productId) {
        query = query.eq("product_id", productId);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching product categories:", error);
        throw error;
      }

      return { data, count };
    },
    enabled: !!productId, // Only fetch if productId is provided
  });
}

// Hook to add a category to a product
export function useAddProductCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      product_id: number;
      category_id: number;
    }) => {
      const { data, error } = await supabase
        .from("product_categories")
        .insert(payload)
        .select();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate the product categories query
      queryClient.invalidateQueries({
        queryKey: ["product_categories", "by_product", variables.product_id],
      });
    },
    onError: (error: PostgrestError) => {
      console.error("Error adding product category:", error);
    },
  });
}

// Hook to remove a category from a product
export function useRemoveProductCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      // First, get the product_id for invalidation
      const { data: categoryData } = await supabase
        .from("product_categories")
        .select("product_id")
        .eq("id", id)
        .single();

      const productId = categoryData?.product_id;

      const { error } = await supabase
        .from("product_categories")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      return { id, productId };
    },
    onSuccess: (result) => {
      if (result.productId) {
        queryClient.invalidateQueries({
          queryKey: ["product_categories", "by_product", result.productId],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: ["product_categories", "by_product"],
        });
      }
    },
    onError: (error: PostgrestError) => {
      console.error("Error removing product category:", error);
    },
  });
}

// Hook to update all categories for a product (batch operation)
export function useUpdateProductCategories() {
  const queryClient = useQueryClient();

  const updateCategories = useCallback(
    async (productId: number, categoryIds: number[]) => {
      try {
        // First, delete all existing category associations
        const { error: deleteError } = await supabase
          .from("product_categories")
          .delete()
          .eq("product_id", productId);

        if (deleteError) {
          throw deleteError;
        }

        // Then, insert new category associations
        if (categoryIds.length > 0) {
          const categoryInserts = categoryIds.map((categoryId) => ({
            product_id: productId,
            category_id: categoryId,
          }));

          const { error: insertError } = await supabase
            .from("product_categories")
            .insert(categoryInserts);

          if (insertError) {
            throw insertError;
          }
        }

        // Invalidate queries
        queryClient.invalidateQueries({
          queryKey: ["product_categories", "by_product", productId],
        });

        return { success: true };
      } catch (error) {
        console.error("Error updating product categories:", error);
        throw error;
      }
    },
    [queryClient]
  );

  return { updateCategories };
}
