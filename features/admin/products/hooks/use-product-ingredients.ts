"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ProductIngredient } from "../types";
import { updateProductIngredientsAction } from "../actions";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

const supabase = getSupabaseBrowserClient();

/**
 * Hook to fetch ingredients for a specific product
 */
export function useProductIngredients(productId: number | null) {
  return useQuery<{ data: ProductIngredient[]; count: number | null }, Error>({
    queryKey: ["product_ingredients", "by_product", productId],
    queryFn: async () => {
      if (!productId) {
        return { data: [], count: 0 }; // Return empty result when productId is null
      }

      try {
        const { data, error, count } = await supabase
          .from("product_ingredients")
          .select(
            "id, product_id, ingredient_id, scent_type, ingredients:ingredients(id, name)"
          )
          .eq("product_id", productId);

        if (error) {
          console.error("Lỗi Supabase khi lấy thành phần sản phẩm:", error);
          throw new Error(error.message || "Không thể lấy thành phần sản phẩm");
        }

        // Sort by scent type manually using a custom order
        const sortedData = data?.sort((a, b) => {
          const order = { top: 1, middle: 2, base: 3 };
          return (
            (order[a.scent_type as keyof typeof order] || 99) -
            (order[b.scent_type as keyof typeof order] || 99)
          );
        });

        return { data: sortedData as ProductIngredient[], count };
      } catch (error) {
        console.error("Lỗi khi lấy thành phần sản phẩm:", error);
        throw new Error(
          error instanceof Error
            ? error.message
            : "Không thể lấy thành phần sản phẩm"
        );
      }
    },
    enabled: !!productId, // Only fetch if productId is provided
  });
}

/**
 * Hook to add an ingredient to a product
 */
export function useAddProductIngredient() {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

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
        throw new Error(
          error.message || "Không thể thêm thành phần vào sản phẩm"
        );
      }

      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate the query to refetch data
      queryClient.invalidateQueries({
        queryKey: ["product_ingredients", "by_product", variables.product_id],
      });

      toast.success("Thành công", {
        description: "Đã thêm thành phần vào sản phẩm thành công",
      });
    },
    onError: (error) => {
      console.error("Lỗi khi thêm thành phần sản phẩm:", error);

      toast.error("Lỗi", {
        description:
          error instanceof Error
            ? error.message
            : "Không thể thêm thành phần vào sản phẩm",
      });
    },
  });
}

/**
 * Hook to remove an ingredient from a product
 */
export function useRemoveProductIngredient() {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

  return useMutation({
    mutationFn: async (id: number) => {
      // First, get the product_id for invalidation
      const { data: ingredientData, error: fetchError } = await supabase
        .from("product_ingredients")
        .select("product_id")
        .eq("id", id)
        .single();

      if (fetchError) {
        throw new Error(
          fetchError.message || "Không thể lấy thông tin thành phần"
        );
      }

      const productId = ingredientData?.product_id;

      // Then delete the ingredient association
      const { error: deleteError } = await supabase
        .from("product_ingredients")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw new Error(
          deleteError.message || "Không thể xóa thành phần khỏi sản phẩm"
        );
      }

      return { id, productId };
    },
    onSuccess: (result) => {
      if (result.productId) {
        queryClient.invalidateQueries({
          queryKey: ["product_ingredients", "by_product", result.productId],
        });

        toast.success("Thành công", {
          description: "Đã xóa thành phần khỏi sản phẩm thành công",
        });
      }
    },
    onError: (error) => {
      console.error("Lỗi khi xóa thành phần sản phẩm:", error);

      toast.error("Lỗi", {
        description:
          error instanceof Error
            ? error.message
            : "Không thể xóa thành phần khỏi sản phẩm",
      });
    },
  });
}

/**
 * Hook to update all ingredients for a product (batch operation)
 */
export function useUpdateProductIngredients() {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

  const updateIngredientsMutation = useMutation({
    mutationFn: async (payload: {
      productId: number;
      ingredients: Array<{
        ingredientId: number;
        scentType: "top" | "middle" | "base";
      }>;
    }) => {
      const { productId, ingredients } = payload;

      const result = await updateProductIngredientsAction(
        productId,
        ingredients
      );

      if (!result.success) {
        throw new Error(
          result.error || "Không thể cập nhật thành phần sản phẩm"
        );
      }

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["product_ingredients", "by_product", variables.productId],
      });

      toast.success("Thành công", {
        description: "Đã cập nhật thành phần sản phẩm thành công",
      });
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật thành phần sản phẩm:", error);

      toast.error("Lỗi", {
        description:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật thành phần sản phẩm",
      });
    },
  });

  // Return a simplified interface
  return {
    updateIngredients: updateIngredientsMutation.mutateAsync,
    isPending: updateIngredientsMutation.isPending,
  };
}
