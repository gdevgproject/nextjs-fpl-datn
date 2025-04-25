"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

const supabase = getSupabaseBrowserClient();

/**
 * Kiểm tra các điều kiện bắt buộc trước khi cho phép xóa vĩnh viễn biến thể sản phẩm
 */
export interface VariantDeleteValidationResult {
  canDelete: boolean;
  blockingReasons: string[];
  details: {
    hasOrderItems: boolean;
    hasCartItems: boolean;
    hasInventoryHistory: boolean;
    isLastActiveVariant: boolean;
  };
}

/**
 * Hook to check if a product variant can be hard deleted based on required conditions
 */
export function useCheckVariantCanDelete() {
  const toast = useSonnerToast();

  return useMutation({
    mutationFn: async (
      variantId: number
    ): Promise<VariantDeleteValidationResult> => {
      try {
        const blockingReasons: string[] = [];
        const details = {
          hasOrderItems: false,
          hasCartItems: false,
          hasInventoryHistory: false,
          isLastActiveVariant: false,
        };

        // 1. Kiểm tra tồn tại trong đơn hàng
        const { count: orderItemCount, error: orderItemError } = await supabase
          .from("order_items")
          .select("*", { count: "exact", head: true })
          .eq("variant_id", variantId);

        if (orderItemError) {
          throw new Error(`Lỗi kiểm tra đơn hàng: ${orderItemError.message}`);
        }

        if (orderItemCount && orderItemCount > 0) {
          blockingReasons.push(
            `Biến thể tồn tại trong ${orderItemCount} đơn hàng`
          );
          details.hasOrderItems = true;
        }

        // 2. Kiểm tra tồn tại trong giỏ hàng
        const { count: cartItemCount, error: cartItemError } = await supabase
          .from("cart_items")
          .select("*", { count: "exact", head: true })
          .eq("variant_id", variantId);

        if (cartItemError) {
          throw new Error(`Lỗi kiểm tra giỏ hàng: ${cartItemError.message}`);
        }

        if (cartItemCount && cartItemCount > 0) {
          blockingReasons.push(
            `Biến thể tồn tại trong ${cartItemCount} giỏ hàng`
          );
          details.hasCartItems = true;
        }

        // 3. Kiểm tra tồn tại trong lịch sử kho
        const { count: inventoryCount, error: inventoryError } = await supabase
          .from("inventory")
          .select("*", { count: "exact", head: true })
          .eq("variant_id", variantId);

        if (inventoryError) {
          throw new Error(
            `Lỗi kiểm tra lịch sử kho: ${inventoryError.message}`
          );
        }

        if (inventoryCount && inventoryCount > 0) {
          blockingReasons.push(
            `Biến thể có ${inventoryCount} bản ghi lịch sử kho`
          );
          details.hasInventoryHistory = true;
        }

        // 4. Kiểm tra biến thể hoạt động cuối cùng
        // Trước tiên lấy product_id của biến thể
        const { data: variantData, error: variantError } = await supabase
          .from("product_variants")
          .select("product_id")
          .eq("id", variantId)
          .single();

        if (variantError) {
          throw new Error(
            `Lỗi lấy thông tin biến thể: ${variantError.message}`
          );
        }

        if (!variantData || !variantData.product_id) {
          throw new Error(
            "Không tìm thấy biến thể hoặc thiếu thông tin sản phẩm"
          );
        }

        // Đếm số biến thể đang hoạt động (deleted_at IS NULL) của cùng sản phẩm, không tính biến thể hiện tại
        const { count: activeVariantsCount, error: countError } = await supabase
          .from("product_variants")
          .select("*", { count: "exact", head: true })
          .eq("product_id", variantData.product_id)
          .is("deleted_at", null)
          .neq("id", variantId);

        if (countError) {
          throw new Error(`Lỗi đếm biến thể hoạt động: ${countError.message}`);
        }

        if (activeVariantsCount === 0) {
          blockingReasons.push(
            "Biến thể này là biến thể hoạt động cuối cùng của sản phẩm"
          );
          details.isLastActiveVariant = true;
        }

        return {
          canDelete: blockingReasons.length === 0,
          blockingReasons,
          details,
        };
      } catch (error) {
        console.error("Error checking variant delete conditions:", error);
        throw error;
      }
    },
  });
}

/**
 * Hook for product deletion operations (soft delete, restore, hard delete)
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

  // Base mutation configuration for all delete operations
  const baseMutationConfig = {
    onSuccess: () => {
      // Invalidate products list query to refetch
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
    },
    onError: (error: Error) => {
      console.error("Lỗi xóa sản phẩm:", error);
    },
  };

  // Soft delete mutation
  const softDeleteMutation = useMutation({
    mutationFn: async (productId: number) => {
      const { data, error } = await supabase
        .from("products")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", productId)
        .select();

      if (error) {
        throw new Error(error.message || "Không thể xóa sản phẩm");
      }

      return data;
    },
    ...baseMutationConfig,
    onSuccess: () => {
      baseMutationConfig.onSuccess();
      toast.success("Thành công", {
        description: "Sản phẩm đã được xóa tạm thời",
      });
    },
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: async (productId: number) => {
      const { data, error } = await supabase
        .from("products")
        .update({ deleted_at: null })
        .eq("id", productId)
        .select();

      if (error) {
        throw new Error(error.message || "Không thể khôi phục sản phẩm");
      }

      return data;
    },
    ...baseMutationConfig,
    onSuccess: () => {
      baseMutationConfig.onSuccess();
      toast.success("Thành công", {
        description: "Sản phẩm đã được khôi phục",
      });
    },
  });

  // Hard delete mutation
  const hardDeleteMutation = useMutation({
    mutationFn: async (productId: number) => {
      // Get product images to delete from storage later
      const { data: images } = await supabase
        .from("product_images")
        .select("image_url")
        .eq("product_id", productId);

      // Delete the product from the database
      const { data, error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) {
        throw new Error(error.message || "Không thể xóa vĩnh viễn sản phẩm");
      }

      // TODO: Queue up a job to clean up orphaned images in storage
      // This should be done in a server action or background job
      // to prevent storage links from being orphaned

      return { data, images };
    },
    ...baseMutationConfig,
    onSuccess: () => {
      baseMutationConfig.onSuccess();
      toast.success("Thành công", {
        description: "Sản phẩm đã được xóa vĩnh viễn",
      });
    },
  });

  // Return the mutations with simplified interface
  return {
    softDelete: softDeleteMutation.mutateAsync,
    restore: restoreMutation.mutateAsync,
    hardDelete: hardDeleteMutation.mutateAsync,
    isPending:
      softDeleteMutation.isPending ||
      restoreMutation.isPending ||
      hardDeleteMutation.isPending,
  };
}
