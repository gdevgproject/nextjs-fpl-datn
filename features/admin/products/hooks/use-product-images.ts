"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductImage } from "../types";
import { createProductImageAction, deleteProductImageAction } from "../actions";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

const supabase = getSupabaseBrowserClient();

/**
 * Hook to fetch images for a specific product
 */
export function useProductImages(productId: number | null) {
  return useQuery<{ data: ProductImage[]; count: number | null }, Error>({
    queryKey: ["product_images", "by_product", productId],
    queryFn: async () => {
      let query = supabase
        .from("product_images")
        .select(
          "id, product_id, image_url, alt_text, is_main, display_order, created_at, updated_at"
        );

      if (productId) {
        query = query.eq("product_id", productId);
      }

      // Apply sorting for optimal display order
      query = query
        .order("is_main", { ascending: false }) // Main image first
        .order("display_order", { ascending: true }); // Then by display order

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching product images:", error);
        throw new Error(error.message || "Failed to fetch product images");
      }

      return { data: data as ProductImage[], count };
    },
    enabled: !!productId, // Only fetch if productId is provided
  });
}

/**
 * Hook to create a new product image using server actions
 */
export function useCreateProductImage() {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

  return useMutation({
    mutationFn: async (payload: {
      productId: number;
      imageUrl: string;
      isMain?: boolean;
      altText?: string;
      displayOrder?: number;
    }) => {
      const {
        productId,
        imageUrl,
        isMain = false,
        altText = "",
        displayOrder = 0,
      } = payload;

      // Add validation to ensure productId is not null
      if (!productId) {
        throw new Error("ID sản phẩm là bắt buộc để tạo hình ảnh");
      }

      const result = await createProductImageAction(
        productId,
        imageUrl,
        isMain,
        altText,
        displayOrder
      );

      if (!result.success) {
        throw new Error(result.error || "Không thể tạo hình ảnh sản phẩm");
      }

      return result.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["product_images", "by_product", variables.productId],
      });

      // Invalidate products list to update product thumbnails in table
      queryClient.invalidateQueries({
        queryKey: ["products", "list"],
      });

      toast.success("Thành công", {
        description: "Đã thêm hình ảnh sản phẩm thành công",
      });
    },
    onError: (error) => {
      console.error("Lỗi khi tạo hình ảnh sản phẩm:", error);

      toast.error("Lỗi", {
        description:
          error instanceof Error
            ? error.message
            : "Không thể thêm hình ảnh sản phẩm",
      });
    },
  });
}

/**
 * Hook to update existing product image
 */
export function useUpdateProductImage() {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

  return useMutation({
    mutationFn: async (payload: {
      id: number;
      productId: number;
      isMain?: boolean;
      altText?: string;
      displayOrder?: number;
    }) => {
      const { id, productId, isMain, altText, displayOrder, ...otherProps } =
        payload;

      // Convert camelCase to snake_case for Supabase
      const updateData = {
        ...(isMain !== undefined && { is_main: isMain }),
        ...(altText !== undefined && { alt_text: altText }),
        ...(displayOrder !== undefined && { display_order: displayOrder }),
        ...otherProps,
      };

      // For updating image properties, but not the image itself
      const { data, error } = await supabase
        .from("product_images")
        .update(updateData)
        .eq("id", id)
        .select();

      if (error) {
        throw new Error(
          error.message || "Không thể cập nhật hình ảnh sản phẩm"
        );
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["product_images", "by_product", variables.productId],
      });

      // Invalidate products list to update thumbnail display in product table
      queryClient.invalidateQueries({
        queryKey: ["products", "list"],
      });

      toast.success("Thành công", {
        description: "Đã cập nhật hình ảnh sản phẩm thành công",
      });
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật hình ảnh sản phẩm:", error);

      toast.error("Lỗi", {
        description:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật hình ảnh sản phẩm",
      });
    },
  });
}

/**
 * Hook to delete a product image and remove from storage
 */
export function useDeleteProductImage() {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

  return useMutation({
    mutationFn: async (payload: {
      id: number;
      imageUrl?: string;
      productId: number;
      isMain?: boolean;
    }) => {
      const { id, imageUrl, productId, isMain } = payload;

      // If this is the main image, try to set another image as main before deleting
      if (isMain) {
        try {
          // Get another image from the same product to set as main
          const { data: otherImages } = await supabase
            .from("product_images")
            .select("id")
            .eq("product_id", productId)
            .neq("id", id)
            .limit(1);

          if (otherImages && otherImages.length > 0) {
            // Set the first available image as main
            await supabase
              .from("product_images")
              .update({ is_main: true })
              .eq("id", otherImages[0].id);
          }
        } catch (err) {
          console.error("Lỗi khi đặt hình ảnh chính mới:", err);
          // Continue with deletion even if setting a new main image fails
        }
      }

      // Delete the image
      const result = await deleteProductImageAction(id, imageUrl || "");

      if (!result.success) {
        throw new Error(result.error || "Không thể xóa hình ảnh sản phẩm");
      }

      return { ...result, productId };
    },
    onSuccess: (result, variables) => {
      // Use the productId passed in the payload to invalidate queries
      queryClient.invalidateQueries({
        queryKey: ["product_images", "by_product", variables.productId],
      });

      // Invalidate products list to update product thumbnails
      queryClient.invalidateQueries({
        queryKey: ["products", "list"],
      });

      toast.success("Thành công", {
        description: "Đã xóa hình ảnh sản phẩm thành công",
      });
    },
    onError: (error) => {
      console.error("Lỗi khi xóa hình ảnh sản phẩm:", error);

      toast.error("Lỗi", {
        description:
          error instanceof Error
            ? error.message
            : "Không thể xóa hình ảnh sản phẩm",
      });
    },
  });
}

/**
 * Hook to set a product image as the main image
 */
export function useSetMainProductImage() {
  const queryClient = useQueryClient();
  const toast = useSonnerToast();

  return useMutation({
    mutationFn: async (payload: { id: number; productId: number }) => {
      const { id, productId } = payload;

      // First, unset any existing main images for this product
      const { error: updateError } = await supabase
        .from("product_images")
        .update({ is_main: false })
        .eq("product_id", productId)
        .eq("is_main", true);

      if (updateError) {
        console.error("Lỗi khi cập nhật hình ảnh chính hiện tại:", updateError);
        throw new Error(updateError.message);
      }

      // Then set the new main image
      const { data, error } = await supabase
        .from("product_images")
        .update({ is_main: true })
        .eq("id", id)
        .select();

      if (error) {
        throw new Error(
          error.message || "Không thể đặt hình ảnh chính cho sản phẩm"
        );
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["product_images", "by_product", variables.productId],
      });

      // Invalidate products list to update product thumbnails in table view
      queryClient.invalidateQueries({
        queryKey: ["products", "list"],
      });

      toast.success("Thành công", {
        description: "Đã cập nhật hình ảnh chính",
      });
    },
    onError: (error) => {
      console.error("Lỗi khi đặt hình ảnh chính:", error);

      toast.error("Lỗi", {
        description:
          error instanceof Error
            ? error.message
            : "Không thể đặt hình ảnh chính",
      });
    },
  });
}
