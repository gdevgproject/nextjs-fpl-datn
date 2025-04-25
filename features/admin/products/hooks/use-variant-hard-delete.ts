"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

const supabase = getSupabaseBrowserClient();

export interface VariantDeleteValidationResult {
  canDelete: boolean;
  blockingReasons: string[];
  details: {
    hasOrderItems: boolean;
    hasCartItems: boolean;
    hasInventoryHistory: boolean;
    isLastActiveVariant: boolean;
    hasOtherBlockingRelations: boolean;
  };
}

/**
 * Hook để quản lý quá trình xóa vĩnh viễn biến thể sản phẩm với kiểm tra điều kiện nghiêm ngặt
 */
export function useVariantHardDelete() {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

  // State để lưu trữ kết quả kiểm tra các điều kiện xóa
  const [validationResult, setValidationResult] =
    useState<VariantDeleteValidationResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<{
    id: number;
    productId: number;
  } | null>(null);

  // Mutation để kiểm tra các điều kiện bắt buộc
  const checkDeleteConditionsMutation = useMutation({
    mutationFn: async (
      variantId: number
    ): Promise<VariantDeleteValidationResult> => {
      try {
        setIsChecking(true);

        const blockingReasons: string[] = [];
        const details = {
          hasOrderItems: false,
          hasCartItems: false,
          hasInventoryHistory: false,
          isLastActiveVariant: false,
          hasOtherBlockingRelations: false,
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
            `Biến thể đang tồn tại trong ${cartItemCount} giỏ hàng người dùng`
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
            `Biến thể có ${inventoryCount} bản ghi lịch sử tồn kho`
          );
          details.hasInventoryHistory = true;
        }

        // 4. Kiểm tra biến thể hoạt động cuối cùng của sản phẩm
        // Lấy product_id của biến thể
        const { data: variantData, error: variantError } = await supabase
          .from("product_variants")
          .select("product_id, deleted_at")
          .eq("id", variantId)
          .single();

        if (variantError) {
          throw new Error(
            `Lỗi lấy thông tin biến thể: ${variantError.message}`
          );
        }

        // Nếu biến thể đang được xóa mềm, bỏ qua kiểm tra biến thể hoạt động cuối cùng
        if (!variantData.deleted_at) {
          // Đếm số biến thể đang hoạt động (deleted_at IS NULL) của sản phẩm (không tính biến thể hiện tại)
          const { count: activeVariantsCount, error: countError } =
            await supabase
              .from("product_variants")
              .select("*", { count: "exact", head: true })
              .eq("product_id", variantData.product_id)
              .is("deleted_at", null)
              .neq("id", variantId);

          if (countError) {
            throw new Error(
              `Lỗi đếm biến thể hoạt động: ${countError.message}`
            );
          }

          if (activeVariantsCount === 0) {
            blockingReasons.push(
              "Đây là biến thể hoạt động cuối cùng của sản phẩm. Bạn nên xóa mềm hoặc xóa vĩnh viễn toàn bộ sản phẩm thay thế."
            );
            details.isLastActiveVariant = true;
          }
        }

        // Kiểm tra các liên kết logic khác (không qua khóa ngoại)
        // Ví dụ: kiểm tra URL trong banners có tham chiếu đến biến thể này không
        // (Có thể bổ sung thêm kiểm tra khác nếu cần)

        return {
          canDelete: blockingReasons.length === 0,
          blockingReasons,
          details,
        };
      } catch (error) {
        console.error("Error checking variant delete conditions:", error);
        throw error;
      } finally {
        setIsChecking(false);
      }
    },
  });

  // Mutation thực hiện xóa vĩnh viễn
  const hardDeleteMutation = useMutation({
    mutationFn: async ({
      variantId,
      productId,
    }: {
      variantId: number;
      productId: number;
    }) => {
      // Kiểm tra lại điều kiện trước khi thực hiện xóa vĩnh viễn
      const validationResult = await checkDeleteConditionsMutation.mutateAsync(
        variantId
      );

      if (!validationResult.canDelete) {
        throw new Error(
          `Không thể xóa vĩnh viễn biến thể: ${validationResult.blockingReasons.join(
            ", "
          )}`
        );
      }

      // Thực hiện xóa vĩnh viễn nếu tất cả điều kiện đều thỏa mãn
      const { error } = await supabase
        .from("product_variants")
        .delete()
        .eq("id", variantId);

      if (error) {
        throw new Error(`Lỗi khi xóa vĩnh viễn biến thể: ${error.message}`);
      }

      return { success: true };
    },
    onSuccess: (_, variables) => {
      // Cập nhật lại dữ liệu sau khi xóa
      queryClient.invalidateQueries({
        queryKey: ["product_variants", variables.productId],
      });
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });

      toast.success("Biến thể đã được xóa vĩnh viễn thành công");

      // Reset state
      setVariantToDelete(null);
      setValidationResult(null);
    },
    onError: (error) => {
      toast.error(
        `Lỗi: ${
          error instanceof Error
            ? error.message
            : "Không thể xóa vĩnh viễn biến thể"
        }`
      );
    },
  });

  // Hàm check điều kiện và chuẩn bị xóa
  const prepareDelete = async (variantId: number, productId: number) => {
    setVariantToDelete({ id: variantId, productId });
    try {
      const result = await checkDeleteConditionsMutation.mutateAsync(variantId);
      setValidationResult(result);
      return result;
    } catch (error) {
      toast.error(
        `Lỗi kiểm tra: ${
          error instanceof Error
            ? error.message
            : "Không thể kiểm tra điều kiện xóa"
        }`
      );
      return null;
    }
  };

  // Hàm thực hiện xóa vĩnh viễn
  const confirmDelete = async () => {
    if (!variantToDelete) return;

    try {
      await hardDeleteMutation.mutateAsync(variantToDelete);
    } catch (error) {
      // Error handling already in mutation
    }
  };

  // Hủy thao tác xóa
  const cancelDelete = () => {
    setVariantToDelete(null);
    setValidationResult(null);
  };

  return {
    prepareDelete,
    confirmDelete,
    cancelDelete,
    validationResult,
    isChecking: isChecking || checkDeleteConditionsMutation.isPending,
    isDeleting: hardDeleteMutation.isPending,
    variantToDelete,
  };
}
