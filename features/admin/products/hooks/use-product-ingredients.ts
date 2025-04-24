"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PostgrestError } from "@supabase/supabase-js";

const supabase = getSupabaseBrowserClient();

// Hook to fetch ingredients for a specific product
export function useProductIngredients(productId: number | null) {
  return useQuery({
    queryKey: ["product_ingredients", "by_product", productId],
    queryFn: async () => {
      let query = supabase
        .from("product_ingredients")
        .select(
          "id, product_id, ingredient_id, scent_type, ingredients:ingredient_id(id, name)"
        );

      if (productId) {
        query = query.eq("product_id", productId);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching product ingredients:", error);
        throw error;
      }

      // Sort by scent type manually since we can't use CASE in Supabase JS client
      const sortedData = data?.sort((a, b) => {
        // Custom order: "top", "middle", "base"
        const order = { top: 1, middle: 2, base: 3 };
        return (
          (order[a.scent_type as keyof typeof order] || 99) -
          (order[b.scent_type as keyof typeof order] || 99)
        );
      });

      return { data: sortedData, count };
    },
    enabled: !!productId, // Only fetch if productId is provided
  });
}

// Hook to add an ingredient to a product
export function useAddProductIngredient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      product_id: number;
      ingredient_id: number;
      scent_type: "top" | "middle" | "base";
    }) => {
      const { data, error } = await supabase
        .from("product_ingredients")
        .insert(payload)
        .select("id");

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate the query to refetch data
      queryClient.invalidateQueries({
        queryKey: ["product_ingredients", "by_product", variables.product_id],
      });
    },
    onError: (error) => {
      console.error("Error adding product ingredient:", error);
    },
  });
}

// Hook to remove an ingredient from a product
export function useRemoveProductIngredient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      // First, get the product_id for invalidation
      const { data: ingredientData } = await supabase
        .from("product_ingredients")
        .select("product_id")
        .eq("id", id)
        .single();

      const productId = ingredientData?.product_id;

      // Then delete the ingredient association
      const { error } = await supabase
        .from("product_ingredients")
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
          queryKey: ["product_ingredients", "by_product", result.productId],
        });
      }
    },
    onError: (error) => {
      console.error("Error removing product ingredient:", error);
    },
  });
}

// Hook to update all ingredients for a product (batch operation)
export function useUpdateProductIngredients() {
  const queryClient = useQueryClient();

  const updateIngredients = async (
    productId: number,
    ingredients: Array<{
      ingredientId: number;
      scentType: "top" | "middle" | "base";
    }>
  ) => {
    try {
      // First, delete all existing ingredient associations
      const { error: deleteError } = await supabase
        .from("product_ingredients")
        .delete()
        .eq("product_id", productId);

      if (deleteError) {
        throw deleteError;
      }

      // Then, insert new ingredient associations
      if (ingredients.length > 0) {
        const ingredientInserts = ingredients.map((item) => ({
          product_id: productId,
          ingredient_id: item.ingredientId,
          scent_type: item.scentType,
        }));

        const { error: insertError } = await supabase
          .from("product_ingredients")
          .insert(ingredientInserts);

        if (insertError) {
          throw insertError;
        }
      }

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: ["product_ingredients", "by_product", productId],
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating product ingredients:", error);
      throw error;
    }
  };

  return { updateIngredients };
}
