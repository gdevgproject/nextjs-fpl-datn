import { z } from "zod";

// Define schema for a single product variant
const productVariantSchema = z.object({
  id: z.number().optional(),
  volume_ml: z.number().min(0, "Dung tích phải lớn hơn 0").default(0),
  price: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0").default(0),
  sale_price: z
    .number()
    .min(0, "Giá khuyến mãi phải lớn hơn hoặc bằng 0")
    .nullish(),
  sku: z.string().min(1, "SKU không được để trống"),
  stock_quantity: z.number().min(0, "Số lượng không được âm").default(0),
});

// Define schema for product label assignment
const productLabelAssignmentSchema = z.object({
  label_id: z.number(),
  valid_until: z.string().nullish(),
});

// Define schema for product form data
export const productFormSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm không được để trống"),
  product_code: z.string().min(1, "Mã sản phẩm không được để trống"),
  short_description: z.string().optional(),
  long_description: z.string().optional(),

  // References to other entities
  brand_id: z.number().nullable(),
  gender_id: z.number().nullable(),
  perfume_type_id: z.number().nullable(),
  concentration_id: z.number().nullable(),

  // Product details
  origin_country: z.string().optional(),
  release_year: z.number().nullable(),
  style: z.string().optional(),
  sillage: z.string().optional(),
  longevity: z.string().optional(),

  // Arrays of related entities
  categories: z.array(z.number()).default([]),
  labels: z.array(productLabelAssignmentSchema).default([]),
  variants: z
    .array(productVariantSchema)
    .min(1, "Sản phẩm phải có ít nhất một biến thể"),
});

// Define schema for product filter
export const productFilterSchema = z.object({
  search: z.string().optional(),
  brand_id: z.number().nullable().optional(),
  gender_id: z.number().nullable().optional(),
  categories: z.array(z.number()).optional(),
  min_price: z.number().nullable().optional(),
  max_price: z.number().nullable().optional(),
  perfume_type_id: z.number().nullable().optional(),
  concentration_id: z.number().nullable().optional(),
  in_stock: z.boolean().optional(),
  has_promotion: z.boolean().optional(),
  labels: z.array(z.number()).optional(),
  deleted: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sort_by: z
    .enum(["name", "price", "created_at", "updated_at"])
    .default("created_at"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
});

// Inventory adjustment validation schema
export const inventoryAdjustmentSchema = z.object({
  variant_id: z.number(),
  change_amount: z.number().int(),
  reason: z.string().min(2, "Phải có lý do cho việc điều chỉnh tồn kho"),
  order_id: z.number().nullable().optional(),
});

// Product bulk action validation schemas
export const bulkDeleteSchema = z.object({
  productIds: z.array(z.number()).min(1, "Phải chọn ít nhất một sản phẩm"),
});

export const bulkRestoreSchema = z.object({
  productIds: z.array(z.number()).min(1, "Phải chọn ít nhất một sản phẩm"),
});

export const bulkCategoryActionSchema = z.object({
  productIds: z.array(z.number()).min(1, "Phải chọn ít nhất một sản phẩm"),
  categoryId: z.number(),
});

export const bulkLabelActionSchema = z.object({
  productIds: z.array(z.number()).min(1, "Phải chọn ít nhất một sản phẩm"),
  labelId: z.number(),
  valid_until: z.string().nullable().optional(),
});

// Export types based on schemas
export type ProductFormData = z.infer<typeof productFormSchema>;
export type ProductFilterData = z.infer<typeof productFilterSchema>;
export type InventoryAdjustmentFormData = z.infer<
  typeof inventoryAdjustmentSchema
>;
