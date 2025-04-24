import { z } from "zod";

/**
 * Type definitions for the products table based on schema.txt
 */
export interface Product {
  id: number;
  name: string;
  slug: string;
  product_code?: string | null;
  short_description?: string | null;
  long_description?: string | null;
  origin_country?: string | null;
  style?: string | null;
  longevity?: string | null;
  sillage?: string | null;
  release_year?: number | null;
  brand_id?: number | null;
  gender_id?: number | null;
  perfume_type_id?: number | null;
  concentration_id?: number | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

/**
 * Type definitions for a product with related entities
 */
export interface ProductWithRelations extends Product {
  brands?: {
    id: number;
    name: string;
    logo_url?: string | null;
  } | null;
  genders?: {
    id: number;
    name: string;
  } | null;
  perfume_types?: {
    id: number;
    name: string;
  } | null;
  concentrations?: {
    id: number;
    name: string;
  } | null;
}

/**
 * Type definitions for product variants
 */
export interface ProductVariant {
  id: number;
  product_id: number;
  volume_ml: number;
  price: number;
  sale_price?: number | null;
  sku: string;
  stock_quantity: number;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Type definitions for product images
 */
export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text?: string | null;
  is_main: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Type definitions for product ingredients
 */
export interface ProductIngredient {
  id: number;
  product_id: number;
  ingredient_id: number;
  scent_type: 'top' | 'middle' | 'base';
  ingredients?: {
    id: number;
    name: string;
    description?: string | null;
  };
}

/**
 * Type definitions for product categories
 */
export interface ProductCategory {
  id: number;
  product_id: number;
  category_id: number;
  categories?: {
    id: number;
    name: string;
    slug?: string;
    description?: string | null;
    parent_category_id?: number | null;
  };
}

/**
 * Filters interface for product queries
 */
export interface ProductFilters {
  search?: string;
  brandId?: number;
  genderId?: number;
  perfumeTypeId?: number;
  concentrationId?: number;
  categoryId?: number;
  includeDeleted?: boolean;
}

/**
 * Pagination interface
 */
export interface ProductPagination {
  page: number;
  pageSize: number;
}

/**
 * Sort interface
 */
export interface ProductSort {
  column: string;
  direction: "asc" | "desc";
}

/**
 * Response interface for list of products
 */
export interface ProductsResponse {
  data: ProductWithRelations[];
  count: number | null;
}

/**
 * Zod schema for product creation validation
 */
export const productSchema = z.object({
  name: z.string()
    .min(1, "Tên sản phẩm không được để trống")
    .max(255, "Tên sản phẩm không được vượt quá 255 ký tự"),
  product_code: z.string()
    .max(100, "Mã sản phẩm không được vượt quá 100 ký tự")
    .optional()
    .nullable(),
  short_description: z.string()
    .max(500, "Mô tả ngắn không được vượt quá 500 ký tự")
    .optional()
    .nullable(),
  long_description: z.string()
    .optional()
    .nullable(),
  origin_country: z.string()
    .max(100, "Xuất xứ không được vượt quá 100 ký tự")
    .optional()
    .nullable(),
  style: z.string()
    .max(100, "Phong cách không được vượt quá 100 ký tự")
    .optional()
    .nullable(),
  longevity: z.string()
    .max(100, "Độ lưu hương không được vượt quá 100 ký tự")
    .optional()
    .nullable(),
  sillage: z.string()
    .max(100, "Độ tỏa hương không được vượt quá 100 ký tự")
    .optional()
    .nullable(),
  release_year: z.number()
    .int("Năm phát hành phải là số nguyên")
    .positive("Năm phát hành phải là số dương")
    .optional()
    .nullable(),
  brand_id: z.number()
    .int("Thương hiệu phải là số nguyên")
    .positive("Thương hiệu phải là số dương")
    .optional()
    .nullable(),
  gender_id: z.number()
    .int("Giới tính phải là số nguyên")
    .positive("Giới tính phải là số dương")
    .optional()
    .nullable(),
  perfume_type_id: z.number()
    .int("Loại nước hoa phải là số nguyên")
    .positive("Loại nước hoa phải là số dương")
    .optional()
    .nullable(),
  concentration_id: z.number()
    .int("Nồng độ phải là số nguyên")
    .positive("Nồng độ phải là số dương")
    .optional()
    .nullable(),
});

/**
 * Zod schema for product variant creation/update validation
 */
export const productVariantSchema = z.object({
  volume_ml: z.string()
    .min(1, "Dung tích không được để trống")
    .refine((val) => !isNaN(Number.parseInt(val)) && Number.parseInt(val) > 0, {
      message: "Dung tích phải là số dương",
    }),
  price: z.string()
    .min(1, "Giá không được để trống")
    .refine((val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) >= 0, {
      message: "Giá phải là số không âm",
    }),
  sale_price: z.string()
    .refine((val) => val === "" || (!isNaN(Number.parseFloat(val)) && Number.parseFloat(val) >= 0), {
      message: "Giá khuyến mãi phải là số không âm",
    })
    .optional(),
  sku: z.string()
    .min(1, "Mã SKU không được để trống"),
  stock_quantity: z.string()
    .min(1, "Số lượng tồn kho không được để trống")
    .refine((val) => !isNaN(Number.parseInt(val)) && Number.parseInt(val) >= 0, {
      message: "Số lượng tồn kho phải là số không âm",
    }),
});

/**
 * Zod schema for product image creation/update validation
 */
export const productImageSchema = z.object({
  image_url: z.string().min(1, "URL hình ảnh không được để trống"),
  alt_text: z.string().optional().nullable(),
  is_main: z.boolean().default(false),
  display_order: z.number().int().min(0).default(0),
});

/**
 * Type for upload product image mutation variables
 */
export interface UploadProductImageVariables {
  file: File;
  fileOptions?: {
    contentType?: string;
    cacheControl?: string;
    upsert?: boolean;
  };
  path?: string;
  createPathOptions?: {
    id?: string | number;
    prefix?: string;
    fileName?: string;
    fileExtension?: string;
  };
}

/**
 * Type for upload product image mutation result
 */
export interface UploadProductImageResult {
  publicUrl: string;
  path: string;
}