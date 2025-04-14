import { z } from "zod"

// Schema for product list filtering
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
  sort_by: z.enum(["name", "price", "created_at", "updated_at"]).default("created_at"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
})

export type ProductFilterData = z.infer<typeof productFilterSchema>

// Schema for product variant in form
const productVariantSchema = z.object({
  id: z.number().optional(),
  volume_ml: z.number().positive("Dung tích phải lớn hơn 0").int("Dung tích phải là số nguyên"),
  price: z.number().positive("Giá phải lớn hơn 0").int("Giá phải là số nguyên"),
  sale_price: z.number().positive("Giá khuyến mãi phải lớn hơn 0").int("Giá phải là số nguyên").nullable().optional(),
  sku: z.string().min(1, "SKU không được để trống"),
  stock_quantity: z.number().min(0, "Số lượng tồn không được âm").int("Số lượng phải là số nguyên"),
})

// Schema for label assignment in form
const labelAssignmentSchema = z.object({
  label_id: z.number(),
  valid_until: z.string().nullable().optional(),
})

// Schema for product form data
export const productFormSchema = z
  .object({
    name: z.string().min(1, "Tên sản phẩm không được để trống").max(255, "Tên sản phẩm không được quá 255 ký tự"),
    product_code: z.string().min(1, "Mã sản phẩm không được để trống").max(50, "Mã sản phẩm không được quá 50 ký tự"),
    short_description: z.string().max(500, "Mô tả ngắn không được quá 500 ký tự").nullable().optional(),
    long_description: z.string().nullable().optional(),
    brand_id: z.number().nullable(),
    gender_id: z.number().nullable(),
    perfume_type_id: z.number().nullable(),
    concentration_id: z.number().nullable(),
    origin_country: z.string().max(100, "Xuất xứ không được quá 100 ký tự").nullable().optional(),
    release_year: z
      .number()
      .int("Năm phát hành phải là số nguyên")
      .min(1900, "Năm phát hành không hợp lệ")
      .max(new Date().getFullYear(), "Năm phát hành không được lớn hơn năm hiện tại")
      .nullable()
      .optional(),
    style: z.string().max(255, "Phong cách không được quá 255 ký tự").nullable().optional(),
    sillage: z.string().max(255, "Độ tỏa hương không được quá 255 ký tự").nullable().optional(),
    longevity: z.string().max(255, "Độ lưu hương không được quá 255 ký tự").nullable().optional(),
    categories: z.array(z.number()),
    labels: z.array(labelAssignmentSchema),
    variants: z.array(productVariantSchema).min(1, "Sản phẩm phải có ít nhất một biến thể"),
  })
  .refine(
    (data) => {
      // Check if there are duplicate volume_ml values in variants
      const volumeValues = data.variants.map((v) => v.volume_ml)
      const uniqueVolumeValues = new Set(volumeValues)
      return uniqueVolumeValues.size === volumeValues.length
    },
    {
      message: "Các biến thể không được có dung tích trùng nhau",
      path: ["variants"],
    },
  )

// Schema for inventory adjustment
export const inventoryAdjustmentSchema = z.object({
  variant_id: z.number(),
  change_amount: z.number().int("Số lượng điều chỉnh phải là số nguyên"),
  reason: z.string().min(1, "Lý do điều chỉnh không được để trống"),
  order_id: z.number().optional().nullable(),
})

// Schema for bulk delete/restore
export const bulkDeleteSchema = z.object({
  productIds: z.array(z.number()).min(1, "Phải chọn ít nhất một sản phẩm"),
})

export const bulkRestoreSchema = bulkDeleteSchema

// Schema for bulk category/label actions
export const bulkCategoryActionSchema = z.object({
  productIds: z.array(z.number()).min(1, "Phải chọn ít nhất một sản phẩm"),
  categoryId: z.number(),
})

export const bulkLabelActionSchema = z.object({
  productIds: z.array(z.number()).min(1, "Phải chọn ít nhất một sản phẩm"),
  labelId: z.number(),
  valid_until: z.string().optional(),
})

