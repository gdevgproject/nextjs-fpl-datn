"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  softDeleteProduct,
  restoreProduct,
  uploadProductImages,
  deleteProductImage,
  updateProductImage,
  adjustInventory,
  getInventoryHistory,
  bulkSoftDeleteProducts,
  bulkRestoreProducts,
  bulkAssignCategoryToProducts,
  bulkRemoveCategoryFromProducts,
  bulkAssignLabelToProducts,
  bulkRemoveLabelFromProducts,
} from "./actions";
import {
  ProductListParams,
  ProductFormData,
  StockAdjustmentParams,
  BulkActionParams,
  BulkCategoryActionParams,
  BulkLabelActionParams,
  ProductLookups,
} from "./types";

// Query key factory
const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params: ProductListParams) =>
    [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
  lookups: ["productLookups"] as const,
  inventoryHistory: (variantId: number) =>
    [...productKeys.all, "inventory", variantId] as const,
};

// Get product list
export function useProductList(params: ProductListParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => getProducts(params),
  });
}

// Get product by ID
export function useProductDetail(productId: number) {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => getProductById(productId),
    enabled: !!productId,
  });
}

// Get inventory history for a variant
export function useInventoryHistory(variantId: number) {
  return useQuery({
    queryKey: productKeys.inventoryHistory(variantId),
    queryFn: () => getInventoryHistory(variantId),
    enabled: !!variantId,
  });
}

// Create a new product
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductFormData) => createProduct(data),
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });

      if (result.productId) {
        queryClient.invalidateQueries({
          queryKey: productKeys.detail(result.productId),
        });
      }
    },
    onError: (error: Error) => {
      toast.error(`Không thể tạo sản phẩm: ${error.message}`);
    },
  });
}

// Update an existing product
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductFormData }) =>
      updateProduct(id, data),
    onSuccess: (result, variables) => {
      toast.success(result.message);
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(`Không thể cập nhật sản phẩm: ${error.message}`);
    },
  });
}

// Soft delete a product
export function useSoftDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) => softDeleteProduct(productId),
    onSuccess: (_, productId) => {
      toast.success("Sản phẩm đã được xóa thành công");
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(productId),
      });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(`Không thể xóa sản phẩm: ${error.message}`);
    },
  });
}

// Restore a product
export function useRestoreProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) => restoreProduct(productId),
    onSuccess: (_, productId) => {
      toast.success("Sản phẩm đã được khôi phục thành công");
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(productId),
      });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(`Không thể khôi phục sản phẩm: ${error.message}`);
    },
  });
}

// Upload product images
export function useUploadProductImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, files }: { productId: number; files: File[] }) =>
      uploadProductImages(productId, files),
    onSuccess: (result, variables) => {
      toast.success(result.message);
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
    },
    onError: (error: Error) => {
      toast.error(`Không thể tải lên ảnh: ${error.message}`);
    },
  });
}

// Delete product image
export function useDeleteProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: number) => deleteProductImage(imageId),
    onSuccess: () => {
      toast.success("Ảnh đã được xóa thành công");
      // We'll invalidate all product queries since we don't have the product ID here
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
    onError: (error: Error) => {
      toast.error(`Không thể xóa ảnh: ${error.message}`);
    },
  });
}

// Update product image
export function useUpdateProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      imageId,
      updates,
    }: {
      imageId: number;
      updates: { is_main?: boolean; alt_text?: string; display_order?: number };
    }) => updateProductImage(imageId, updates),
    onSuccess: () => {
      toast.success("Ảnh đã được cập nhật thành công");
      // We'll invalidate all product queries since we don't have the product ID here
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
    onError: (error: Error) => {
      toast.error(`Không thể cập nhật ảnh: ${error.message}`);
    },
  });
}

// Adjust inventory
export function useAdjustInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StockAdjustmentParams) => adjustInventory(data),
    onSuccess: (_, variables) => {
      toast.success("Tồn kho đã được điều chỉnh thành công");
      // Invalidate the variant's inventory history
      queryClient.invalidateQueries({
        queryKey: productKeys.inventoryHistory(variables.variant_id),
      });
      // Invalidate all product queries to update stock display
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
    onError: (error: Error) => {
      toast.error(`Không thể điều chỉnh tồn kho: ${error.message}`);
    },
  });
}

// Bulk delete products
export function useBulkSoftDeleteProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: BulkActionParams) => bulkSoftDeleteProducts(params),
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(`Không thể xóa hàng loạt: ${error.message}`);
    },
  });
}

// Bulk restore products
export function useBulkRestoreProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: BulkActionParams) => bulkRestoreProducts(params),
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(`Không thể khôi phục hàng loạt: ${error.message}`);
    },
  });
}

// Bulk assign category to products
export function useBulkAssignCategoryToProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: BulkCategoryActionParams) =>
      bulkAssignCategoryToProducts(params),
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      // Invalidate individual product details that were affected
      if (result.affectedCount && result.affectedCount > 0) {
        queryClient.invalidateQueries({ queryKey: productKeys.details() });
      }
    },
    onError: (error: Error) => {
      toast.error(`Không thể thêm danh mục hàng loạt: ${error.message}`);
    },
  });
}

// Bulk remove category from products
export function useBulkRemoveCategoryFromProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: BulkCategoryActionParams) =>
      bulkRemoveCategoryFromProducts(params),
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      // Invalidate individual product details that were affected
      if (result.affectedCount && result.affectedCount > 0) {
        queryClient.invalidateQueries({ queryKey: productKeys.details() });
      }
    },
    onError: (error: Error) => {
      toast.error(`Không thể xóa danh mục hàng loạt: ${error.message}`);
    },
  });
}

// Bulk assign label to products
export function useBulkAssignLabelToProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: BulkLabelActionParams) =>
      bulkAssignLabelToProducts(params),
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      // Invalidate individual product details that were affected
      if (result.affectedCount && result.affectedCount > 0) {
        queryClient.invalidateQueries({ queryKey: productKeys.details() });
      }
    },
    onError: (error: Error) => {
      toast.error(`Không thể thêm nhãn hàng loạt: ${error.message}`);
    },
  });
}

// Bulk remove label from products
export function useBulkRemoveLabelFromProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: BulkLabelActionParams) =>
      bulkRemoveLabelFromProducts(params),
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      // Invalidate individual product details that were affected
      if (result.affectedCount && result.affectedCount > 0) {
        queryClient.invalidateQueries({ queryKey: productKeys.details() });
      }
    },
    onError: (error: Error) => {
      toast.error(`Không thể xóa nhãn hàng loạt: ${error.message}`);
    },
  });
}

// Query to fetch lookup data for product forms
export function useProductLookups() {
  return useQuery({
    queryKey: productKeys.lookups,
    queryFn: async (): Promise<ProductLookups> => {
      const response = await fetch("/api/admin/product-lookups");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch product lookups");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
