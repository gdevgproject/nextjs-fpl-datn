"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

const supabase = getSupabaseBrowserClient();

/**
 * Hook to fetch variants for a specific product
 */
export function useProductVariants(
  productId: number | null,
  includeDeleted: boolean = false
) {
  return useQuery({
    queryKey: ["product_variants", productId, { includeDeleted }],
    queryFn: async () => {
      if (!productId) {
        return { data: [], count: null };
      }

      let query = supabase
        .from("product_variants")
        .select("*", { count: "exact" })
        .eq("product_id", productId);

      // Lọc theo trạng thái xóa
      if (includeDeleted) {
        // Nếu đã chọn hiển thị sản phẩm đã xóa, CHỈ hiển thị các biến thể đã xóa
        query = query.not("deleted_at", "is", null);
      } else {
        // Ngược lại, chỉ hiển thị các biến thể chưa xóa
        query = query.is("deleted_at", null);
      }

      const { data, error, count } = await query.order("volume_ml", {
        ascending: true,
      });

      if (error) {
        console.error("Lỗi khi lấy biến thể sản phẩm:", error);
        throw new Error(error.message || "Không thể lấy biến thể sản phẩm");
      }

      return { data, count };
    },
    enabled: !!productId, // Only fetch if productId is provided
    staleTime: 0, // Đảm bảo luôn refetch khi có thay đổi
    refetchOnMount: true, // Luôn refetch khi component mount
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
      product_id: number;
      volume_ml: number;
      price: number;
      sale_price: number | null;
      sku: string | null;
      stock_quantity: number;
    }) => {
      try {
        const { data, error } = await supabase
          .from("product_variants")
          .insert(payload)
          .select()
          .single();

        if (error) {
          throw new Error(error.message || "Không thể tạo biến thể sản phẩm");
        }

        return data;
      } catch (error) {
        console.error("Lỗi khi tạo biến thể sản phẩm:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["product_variants", data.product_id],
      });

      // Also invalidate products list query to update stock status
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });

      toast.success("Thành công", {
        description: "Đã tạo biến thể sản phẩm thành công",
      });
    },
    onError: (error) => {
      toast.error("Lỗi", {
        description:
          error instanceof Error
            ? error.message
            : "Không thể tạo biến thể sản phẩm",
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
      product_id: number;
      volume_ml: number;
      price: number;
      sale_price: number | null;
      sku: string | null;
      stock_quantity: number;
    }) => {
      try {
        const { id, ...updateData } = payload;

        const { data, error } = await supabase
          .from("product_variants")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          throw new Error(
            error.message || "Không thể cập nhật biến thể sản phẩm"
          );
        }

        return data;
      } catch (error) {
        console.error("Lỗi khi cập nhật biến thể sản phẩm:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["product_variants", data.product_id],
      });

      // Also invalidate products list query to update stock status
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });

      toast.success("Thành công", {
        description: "Đã cập nhật biến thể sản phẩm thành công",
      });
    },
    onError: (error) => {
      toast.error("Lỗi", {
        description:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật biến thể sản phẩm",
      });
    },
  });
}

/**
 * Hook for product variant deletion operations (soft delete, restore, hard delete)
 */
export function useDeleteProductVariant() {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

  // Soft delete mutation (mark as deleted)
  const softDeleteMutation = useMutation({
    mutationFn: async (variantId: number) => {
      try {
        // First, get the product_id for invalidation
        const { data: variantData, error: fetchError } = await supabase
          .from("product_variants")
          .select("product_id")
          .eq("id", variantId)
          .single();

        if (fetchError) {
          throw new Error(
            fetchError.message || "Không thể lấy thông tin biến thể sản phẩm"
          );
        }

        const productId = variantData?.product_id;

        // Perform soft delete by updating deleted_at field
        const { data, error } = await supabase
          .from("product_variants")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", variantId)
          .select();

        if (error) {
          throw new Error(error.message || "Không thể xóa biến thể sản phẩm");
        }

        return { data, productId };
      } catch (error) {
        console.error("Lỗi khi xóa biến thể sản phẩm:", error);
        throw error;
      }
    },
    onSuccess: (result) => {
      // Invalidate all queries for this product's variants regardless of includeDeleted setting
      queryClient.invalidateQueries({
        queryKey: ["product_variants", result.productId],
        exact: false, // Invalidate tất cả các queries liên quan đến product variants bất kể giá trị includeDeleted
      });

      // Also invalidate products list query to update stock status
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });

      toast.success("Thành công", {
        description: "Đã xóa biến thể sản phẩm thành công",
      });
    },
    onError: (error) => {
      toast.error("Lỗi", {
        description:
          error instanceof Error
            ? error.message
            : "Không thể xóa biến thể sản phẩm",
      });
    },
  });

  // Restore mutation (undelete)
  const restoreMutation = useMutation({
    mutationFn: async (variantId: number) => {
      try {
        // First, get the product_id for invalidation
        const { data: variantData, error: fetchError } = await supabase
          .from("product_variants")
          .select("product_id")
          .eq("id", variantId)
          .single();

        if (fetchError) {
          throw new Error(
            fetchError.message || "Không thể lấy thông tin biến thể sản phẩm"
          );
        }

        const productId = variantData?.product_id;

        // Restore by setting deleted_at to null
        const { data, error } = await supabase
          .from("product_variants")
          .update({ deleted_at: null })
          .eq("id", variantId)
          .select();

        if (error) {
          throw new Error(
            error.message || "Không thể khôi phục biến thể sản phẩm"
          );
        }

        return { data, productId };
      } catch (error) {
        console.error("Lỗi khi khôi phục biến thể sản phẩm:", error);
        throw error;
      }
    },
    onSuccess: (result) => {
      // Invalidate all queries for this product's variants regardless of includeDeleted setting
      queryClient.invalidateQueries({
        queryKey: ["product_variants", result.productId],
        exact: false, // Invalidate tất cả các queries liên quan đến product variants bất kể giá trị includeDeleted
      });

      // Also invalidate products list query to update stock status
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });

      toast.success("Thành công", {
        description: "Đã khôi phục biến thể sản phẩm thành công",
      });
    },
    onError: (error) => {
      toast.error("Lỗi", {
        description:
          error instanceof Error
            ? error.message
            : "Không thể khôi phục biến thể sản phẩm",
      });
    },
  });

  // Restore all variants for a product
  const restoreAllVariantsMutation = useMutation({
    mutationFn: async (productId: number) => {
      try {
        // Restore all variants by setting deleted_at to null
        const { data, error } = await supabase
          .from("product_variants")
          .update({ deleted_at: null })
          .eq("product_id", productId)
          .not("deleted_at", "is", null) // Chỉ khôi phục những biến thể đã bị ẩn
          .select();

        if (error) {
          throw new Error(
            error.message || "Không thể khôi phục tất cả biến thể sản phẩm"
          );
        }

        return { data, productId, count: data.length };
      } catch (error) {
        console.error("Lỗi khi khôi phục tất cả biến thể sản phẩm:", error);
        throw error;
      }
    },
    onSuccess: (result) => {
      // Invalidate all queries for this product's variants
      queryClient.invalidateQueries({
        queryKey: ["product_variants", result.productId],
        exact: false,
      });

      // Also invalidate products list query to update stock status
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });

      toast.success("Thành công", {
        description: `Đã khôi phục ${result.count} biến thể sản phẩm thành công`,
      });
    },
    onError: (error) => {
      toast.error("Lỗi", {
        description:
          error instanceof Error
            ? error.message
            : "Không thể khôi phục tất cả biến thể sản phẩm",
      });
    },
  });

  // Return the mutations with simplified interface
  return {
    softDelete: softDeleteMutation.mutateAsync,
    restore: restoreMutation.mutateAsync,
    restoreAllVariants: restoreAllVariantsMutation.mutateAsync,
    isPending:
      softDeleteMutation.isPending ||
      restoreMutation.isPending ||
      restoreAllVariantsMutation.isPending,
  };
}
