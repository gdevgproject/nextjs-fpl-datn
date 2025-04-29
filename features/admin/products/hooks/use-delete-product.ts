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

// Helper function to check if a product has any active variants
async function checkHasActiveVariants(productId: number): Promise<boolean> {
  const { data, error, count } = await supabase
    .from("product_variants")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId)
    .is("deleted_at", null);

  if (error) {
    console.error("Error checking active variants:", error);
    throw new Error("Không thể kiểm tra trạng thái biến thể của sản phẩm");
  }

  return count !== null && count > 0;
}

// Helper function to check if a product has any variants (including hidden ones)
async function checkHasAnyVariants(productId: number): Promise<boolean> {
  const { data, error, count } = await supabase
    .from("product_variants")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId);

  if (error) {
    console.error("Error checking any variants:", error);
    throw new Error("Không thể kiểm tra danh sách biến thể của sản phẩm");
  }

  return count !== null && count > 0;
}

// Helper function to get counts of all product variants
async function getProductVariantCounts(productId: number): Promise<{
  totalVariants: number;
  activeVariants: number;
  hiddenVariants: number;
}> {
  try {
    // Get count of all variants
    const { count: totalCount, error: totalError } = await supabase
      .from("product_variants")
      .select("*", { count: "exact", head: true })
      .eq("product_id", productId);

    if (totalError) throw totalError;

    // Get count of active variants
    const { count: activeCount, error: activeError } = await supabase
      .from("product_variants")
      .select("*", { count: "exact", head: true })
      .eq("product_id", productId)
      .is("deleted_at", null);

    if (activeError) throw activeError;

    // Get count of hidden variants
    const { count: hiddenCount, error: hiddenError } = await supabase
      .from("product_variants")
      .select("*", { count: "exact", head: true })
      .eq("product_id", productId)
      .not("deleted_at", "is", null);

    if (hiddenError) throw hiddenError;

    return {
      totalVariants: totalCount || 0,
      activeVariants: activeCount || 0,
      hiddenVariants: hiddenCount || 0,
    };
  } catch (error) {
    console.error("Error fetching variant counts:", error);
    throw new Error("Không thể đếm số lượng biến thể sản phẩm");
  }
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
        // 1. Get all variants for the product
        const { data: variants, error: variantsError } = await supabase
          .from("product_variants")
          .select("id")
          .eq("product_id", productId)
          .is("deleted_at", null); // Only hide variants that aren't already hidden

        if (variantsError) {
          console.error("Error fetching variants:", variantsError);
          throw new Error("Không thể lấy danh sách biến thể của sản phẩm");
        }

        // 2. Soft delete the product
        const { data, error } = await supabase
          .from("products")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", productId)
          .select();

        if (error) {
          console.error("Soft delete error:", error);
          throw new Error(error.message || "Không thể ẩn sản phẩm");
        }

        // 3. Soft delete all active variants
        if (variants && variants.length > 0) {
          const now = new Date().toISOString();
          const variantIds = variants.map((variant) => variant.id);

          const { error: variantDeleteError } = await supabase
            .from("product_variants")
            .update({ deleted_at: now })
            .in("id", variantIds);

          if (variantDeleteError) {
            console.error("Variant soft delete error:", variantDeleteError);
            // We don't throw here as the product is already hidden
            // Just log the error and continue
          }
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
      queryClient.invalidateQueries({ queryKey: ["product-variants"] });
      toast.success("Thành công", {
        description: "Sản phẩm và các biến thể đã được ẩn thành công",
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
    mutationFn: async ({
      productId,
      restoreAllVariants = false,
    }: {
      productId: number;
      restoreAllVariants?: boolean;
    }) => {
      try {
        // 0. Kiểm tra xem sản phẩm có biến thể nào không (bao gồm cả biến thể đã ẩn)
        const hasAnyVariants = await checkHasAnyVariants(productId);
        if (!hasAnyVariants) {
          throw new Error(
            "Không thể khôi phục sản phẩm vì sản phẩm không có biến thể nào. Một sản phẩm cần phải có ít nhất một biến thể để hoạt động."
          );
        }

        // 1. Lấy số liệu thống kê về biến thể của sản phẩm
        const variantCounts = await getProductVariantCounts(productId);

        // Nếu không có biến thể nào (kể cả biến thể đã ẩn), không thể khôi phục
        if (variantCounts.totalVariants === 0) {
          throw new Error(
            "Không thể khôi phục sản phẩm vì sản phẩm không có biến thể nào. Một sản phẩm cần phải có ít nhất một biến thể để hoạt động."
          );
        }

        // Nếu không có biến thể đang hoạt động và không chọn khôi phục tất cả
        if (
          variantCounts.activeVariants === 0 &&
          !restoreAllVariants &&
          variantCounts.hiddenVariants > 0
        ) {
          throw new Error(
            "Sản phẩm này không có biến thể nào đang hoạt động. Vui lòng chọn 'Khôi phục tất cả biến thể' để khôi phục sản phẩm."
          );
        }

        // 2. Get all hidden variants for the product
        const { data: variants, error: variantsError } = await supabase
          .from("product_variants")
          .select("id, deleted_at")
          .eq("product_id", productId)
          .not("deleted_at", "is", null); // Only get variants that are currently hidden

        if (variantsError) {
          console.error("Error fetching hidden variants:", variantsError);
          throw new Error("Không thể lấy danh sách biến thể ẩn của sản phẩm");
        }

        // 3. Restore the product
        const { data, error } = await supabase
          .from("products")
          .update({ deleted_at: null })
          .eq("id", productId)
          .select();

        if (error) {
          console.error("Restore error:", error);
          throw new Error(error.message || "Không thể hiển thị lại sản phẩm");
        }

        // 4. Restore variants based on the restoreAllVariants parameter
        if (variants && variants.length > 0) {
          if (restoreAllVariants || variantCounts.activeVariants === 0) {
            // Restore ALL hidden variants if restoreAllVariants is true or there are no active variants
            const variantIds = variants.map((variant) => variant.id);
            const { error: variantRestoreError } = await supabase
              .from("product_variants")
              .update({ deleted_at: null })
              .in("id", variantIds);

            if (variantRestoreError) {
              console.error("Variant restore error:", variantRestoreError);
              // We don't throw here as the product is already restored
              // Just log the error and continue
            }
          } else {
            // Otherwise, only restore variants that were hidden with the product (previous behavior)
            // Get the product's deleted_at timestamp
            const { data: productData, error: productError } = await supabase
              .from("products")
              .select("deleted_at")
              .eq("id", productId)
              .single();

            if (productError) {
              console.error("Error fetching product timestamp:", productError);
              // Continue without variant restoration if we can't get product timestamp
            } else if (productData) {
              const productDeletedTime = new Date(
                productData.deleted_at
              ).getTime();

              // Filter variants that were hidden at the same time or within 5 seconds of the product
              // This helps catch variants that were hidden as part of the product hide operation
              const variantsToRestore = variants
                .filter((variant) => {
                  const variantDeletedTime = new Date(
                    variant.deleted_at
                  ).getTime();
                  // Allow 5 second margin for batch operations
                  return (
                    Math.abs(variantDeletedTime - productDeletedTime) <= 5000
                  );
                })
                .map((variant) => variant.id);

              if (variantsToRestore.length > 0) {
                const { error: variantRestoreError } = await supabase
                  .from("product_variants")
                  .update({ deleted_at: null })
                  .in("id", variantsToRestore);

                if (variantRestoreError) {
                  console.error("Variant restore error:", variantRestoreError);
                  // We don't throw here as the product is already restored
                  // Just log the error and continue
                }
              }
            }
          }
        }

        return {
          data,
          variantStats: await getProductVariantCounts(productId), // Return updated counts
        };
      } catch (error) {
        console.error("Exception in restore:", error);
        throw error;
      }
    },
    onSuccess: (result) => {
      // Immediately invalidate all product queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-variants"] });

      // Thông báo thành công chi tiết hơn
      let description = "Sản phẩm đã được hiển thị lại thành công";

      // Nếu có thông tin về biến thể được khôi phục, hiển thị chi tiết
      if (result?.variantStats) {
        const { activeVariants } = result.variantStats;
        description += ` với ${activeVariants} biến thể đang hoạt động`;
      }

      toast.success("Khôi phục thành công", { description });
    },
    onError: (error: Error) => {
      console.error("Lỗi hiển thị lại sản phẩm:", error);
      toast.error("Không thể khôi phục", {
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
