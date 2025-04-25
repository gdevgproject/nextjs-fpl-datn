"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ProductCategory } from "../types";
import { updateProductCategoriesAction } from "../actions";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

const supabase = getSupabaseBrowserClient();

/**
 * Hook to fetch categories for a specific product
 */
export function useProductCategories(productId: number | null) {
  return useQuery<{ data: ProductCategory[]; count: number | null }, Error>({
    queryKey: ["product_categories", "by_product", productId],
    queryFn: async () => {
      try {
        let query = supabase
          .from("product_categories")
          .select(
            "id, product_id, category_id, categories:category_id(id, name, slug, description, parent_category_id)"
          );

        if (productId) {
          query = query.eq("product_id", productId);
        }

        const { data, error, count } = await query;

        if (error) {
          throw error;
        }

        return { data: data as ProductCategory[], count };
      } catch (error) {
        console.error("Error fetching product categories:", error);
        throw new Error(
          error instanceof Error
            ? error.message
            : "Unknown error fetching product categories"
        );
      }
    },
    enabled: !!productId, // Only fetch if productId is provided
  });
}

/**
 * Hook to add a category to a product
 */
export function useAddProductCategory() {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

  return useMutation({
    mutationFn: async (payload: {
      product_id: number;
      category_id: number;
    }) => {
      const { data, error } = await supabase
        .from("product_categories")
        .insert(payload)
        .select("id");

      if (error) {
        throw new Error(error.message || "Failed to add category to product");
      }

      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate the query to refetch data
      queryClient.invalidateQueries({
        queryKey: ["product_categories", "by_product", variables.product_id],
      });

      toast.success("Success", {
        description: "Category added to product successfully",
      });
    },
    onError: (error) => {
      console.error("Error adding product category:", error);

      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to add category to product",
      });
    },
  });
}

/**
 * Hook to remove a category from a product
 */
export function useRemoveProductCategory() {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

  return useMutation({
    mutationFn: async (id: number) => {
      // First, get the product_id for invalidation
      const { data: categoryData, error: fetchError } = await supabase
        .from("product_categories")
        .select("product_id")
        .eq("id", id)
        .single();

      if (fetchError) {
        throw new Error(
          fetchError.message || "Failed to fetch category information"
        );
      }

      const productId = categoryData?.product_id;

      // Then delete the category association
      const { error: deleteError } = await supabase
        .from("product_categories")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw new Error(
          deleteError.message || "Failed to remove category from product"
        );
      }

      return { id, productId };
    },
    onSuccess: (result) => {
      if (result.productId) {
        queryClient.invalidateQueries({
          queryKey: ["product_categories", "by_product", result.productId],
        });

        toast.success("Success", {
          description: "Category removed from product successfully",
        });
      }
    },
    onError: (error) => {
      console.error("Error removing product category:", error);

      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to remove category from product",
      });
    },
  });
}

/**
 * Hook to update all categories for a product (batch operation)
 */
export function useUpdateProductCategories() {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

  const updateCategoriesMutation = useMutation({
    mutationFn: async (payload: {
      productId: number;
      categoryIds: number[];
    }) => {
      const { productId, categoryIds } = payload;

      const result = await updateProductCategoriesAction(
        productId,
        categoryIds
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to update product categories");
      }

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["product_categories", "by_product", variables.productId],
      });

      toast.success("Success", {
        description: "Product categories updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating product categories:", error);

      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to update product categories",
      });
    },
  });

  // Return a simplified interface
  return {
    updateCategories: updateCategoriesMutation.mutateAsync,
    isPending: updateCategoriesMutation.isPending,
  };
}
