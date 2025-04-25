"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

const supabase = getSupabaseBrowserClient();

/**
 * Hook to fetch scents assigned to a specific product
 */
export function useProductScents(productId: number | null) {
  return useQuery<{ data: any[]; count: number | null }, Error>({
    queryKey: ["product_scents", "by_product", productId],
    queryFn: async () => {
      let query = supabase.from("product_scents").select(
        `
          id, 
          scent:scent_id(id, name, description),
          created_at, 
          updated_at
        `
      );

      if (productId) {
        query = query.eq("product_id", productId);
      }

      query = query.order("created_at", { ascending: true });
      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Error fetching product scents: ${error.message}`);
      }

      return { data: data || [], count };
    },
    enabled: !!productId, // Only fetch if productId is provided
  });
}

/**
 * Hook to add a scent to a product
 */
export function useAddProductScent() {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

  return useMutation({
    mutationFn: async (payload: { productId: number; scentId: number }) => {
      const { productId, scentId } = payload;

      // Add validation to ensure productId is not null
      if (!productId) {
        throw new Error("Product ID is required");
      }

      if (!scentId) {
        throw new Error("Scent ID is required");
      }

      // Check if the scent is already assigned to the product
      const { data: existingScents, error: checkError } = await supabase
        .from("product_scents")
        .select("id")
        .eq("product_id", productId)
        .eq("scent_id", scentId)
        .maybeSingle();

      if (checkError) {
        throw new Error(`Error checking existing scent: ${checkError.message}`);
      }

      if (existingScents) {
        throw new Error("This scent is already assigned to the product");
      }

      // Insert the new product-scent relationship
      const { data, error } = await supabase
        .from("product_scents")
        .insert({
          product_id: productId,
          scent_id: scentId,
        })
        .select();

      if (error) {
        throw new Error(`Error adding scent to product: ${error.message}`);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["product_scents", "by_product", variables.productId],
      });

      toast.success("Success", {
        description: "Scent added to product successfully",
      });
    },
    onError: (error) => {
      console.error("Error adding scent to product:", error);

      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to add scent to product",
      });
    },
  });
}

/**
 * Hook to remove a scent from a product
 */
export function useRemoveProductScent() {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

  return useMutation({
    mutationFn: async (payload: { id: number; productId: number }) => {
      const { id, productId } = payload;

      // Validate input
      if (!id) {
        throw new Error("Product scent ID is required");
      }

      if (!productId) {
        throw new Error("Product ID is required");
      }

      // Delete the product-scent relationship
      const { error } = await supabase
        .from("product_scents")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(`Error removing scent from product: ${error.message}`);
      }

      return { id, productId };
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["product_scents", "by_product", variables.productId],
      });

      toast.success("Success", {
        description: "Scent removed from product successfully",
      });
    },
    onError: (error) => {
      console.error("Error removing scent from product:", error);

      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to remove scent from product",
      });
    },
  });
}
