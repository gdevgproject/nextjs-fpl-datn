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

  // Soft delete mutation
  const softDeleteMutation = useMutation({
    mutationFn: async (productId: number) => {
      try {
        const { data, error } = await supabase
          .from("products")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", productId)
          .select();

        if (error) {
          console.error("Soft delete error:", error);
          throw new Error(error.message || "Không thể ẩn sản phẩm");
        }

        return data;
      } catch (error) {
        console.error("Exception in softDelete:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Immediately invalidate all product queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Thành công", {
        description: "Sản phẩm đã được ẩn thành công",
      });
    },
    onError: (error: Error) => {
      console.error("Lỗi ẩn sản phẩm:", error);
      toast.error("Lỗi", {
        description: error.message || "Không thể ẩn sản phẩm",
      });
    },
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: async (productId: number) => {
      try {
        const { data, error } = await supabase
          .from("products")
          .update({ deleted_at: null })
          .eq("id", productId)
          .select();

        if (error) {
          console.error("Restore error:", error);
          throw new Error(error.message || "Không thể hiển thị lại sản phẩm");
        }

        return data;
      } catch (error) {
        console.error("Exception in restore:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Immediately invalidate all product queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Thành công", {
        description: "Sản phẩm đã được hiển thị lại thành công",
      });
    },
    onError: (error: Error) => {
      console.error("Lỗi hiển thị lại sản phẩm:", error);
      toast.error("Lỗi", {
        description: error.message || "Không thể hiển thị lại sản phẩm",
      });
    },
  });

  // Hard delete mutation
  const hardDeleteMutation = useMutation({
    mutationFn: async (productId: number) => {
      try {
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
          console.error("Hard delete error:", error);
          throw new Error(error.message || "Không thể xóa vĩnh viễn sản phẩm");
        }

        return { data, images };
      } catch (error) {
        console.error("Exception in hardDelete:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Immediately invalidate all product queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Thành công", {
        description: "Sản phẩm đã được xóa vĩnh viễn thành công",
      });
    },
    onError: (error: Error) => {
      console.error("Lỗi xóa vĩnh viễn sản phẩm:", error);
      toast.error("Lỗi", {
        description: error.message || "Không thể xóa vĩnh viễn sản phẩm",
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
