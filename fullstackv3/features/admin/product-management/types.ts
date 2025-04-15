// Import TypeScript types from the database schema
import type { Database } from "@/lib/types/database.types"

// Define base types
export type Brand = Database["public"]["Tables"]["brands"]["Row"]
export type Category = Database["public"]["Tables"]["categories"]["Row"]
export type Gender = Database["public"]["Tables"]["genders"]["Row"]
export type PerfumeType = Database["public"]["Tables"]["perfume_types"]["Row"]
export type Concentration = Database["public"]["Tables"]["concentrations"]["Row"]
export type ProductLabel = Database["public"]["Tables"]["product_labels"]["Row"]
export type Scent = Database["public"]["Tables"]["scents"]["Row"] & {
  product_scents?: {
    scent_type: string
  }[]
}
export type Ingredient = Database["public"]["Tables"]["ingredients"]["Row"]

// Product list and filter types
export type ProductListParams = {
  search?: string
  brand_id?: number | null
  gender_id?: number | null
  categories?: number[]
  min_price?: number | null
  max_price?: number | null
  perfume_type_id?: number | null
  concentration_id?: number | null
  in_stock?: boolean
  has_promotion?: boolean
  labels?: number[]
  deleted?: boolean
  page: number
  limit: number
  sort_by: "name" | "price" | "created_at" | "updated_at"
  sort_order: "asc" | "desc"
}

export type ProductVariant = {
  id: number
  volume_ml: number
  price: number
  sale_price: number | null
  stock_quantity: number
  sku: string
}

export type ProductImage = {
  id: number
  image_url: string
  alt_text: string | null
  is_main: boolean
  display_order: number
}

export type ProductListItem = {
  id: number
  name: string
  product_code: string
  brand: { id: number; name: string } | null
  variants: ProductVariant[]
  created_at: string
  updated_at: string
  deleted_at: string | null
  has_promotion: boolean
  main_image: string | null
}

export type ProductListResponse = {
  data: ProductListItem[]
  total: number
  page: number
  limit: number
}

// Product detail types
export type ProductDetail = {
  id: number
  name: string
  product_code: string
  short_description: string | null
  long_description: string | null
  brand: Brand | null
  gender: Gender | null
  perfume_type: PerfumeType | null
  concentration: Concentration | null
  origin_country: string | null
  release_year: number | null
  style: string | null
  sillage: string | null
  longevity: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  variants: ProductVariant[]
  images: ProductImage[]
  categories: Category[]
  labels: (ProductLabel & {
    product_label_assignments: {
      valid_until: string | null
    }[]
  })[]
  scents: Scent[]
  ingredients: Ingredient[]
}

export type ProductDetailResponse = {
  data: ProductDetail | null
  error?: string
}

// Product form types
export type ProductFormData = {
  name: string
  product_code: string
  short_description?: string
  long_description?: string
  brand_id: number | null
  gender_id: number | null
  perfume_type_id: number | null
  concentration_id: number | null
  origin_country?: string
  release_year: number | null
  style?: string
  sillage?: string
  longevity?: string
  categories: number[]
  labels: { label_id: number; valid_until?: string | null }[]
  variants: {
    id?: number
    volume_ml: number
    price: number
    sale_price?: number | null
    sku: string
    stock_quantity: number
  }[]
}

export type ProductMutationResponse = {
  success: boolean
  message: string
  productId?: number
}

// Bulk action types
export type BulkActionParams = {
  productIds: number[]
}

export type BulkCategoryActionParams = {
  productIds: number[]
  categoryId: number
}

export type BulkLabelActionParams = {
  productIds: number[]
  labelId: number
  valid_until?: string | null
}

export type BulkActionResponse = {
  success: boolean
  message: string
  affectedCount?: number
}

// Inventory related types
export type StockAdjustmentParams = {
  variant_id: number
  change_amount: number
  reason: string
  order_id?: number | null
}

export type InventoryRecord = {
  id: number
  variant_id: number
  change_amount: number
  stock_after_change: number
  reason: string
  order_id: number | null
  timestamp: string
  updated_by: string | null
  updated_by_name: string
  product_id: number
  product_name: string
  variant_volume: number
}

// Image upload types
export type UploadImagesResponse = {
  success: boolean
  message: string
  images: { path: string; id: number }[]
  errors: string[]
}

// Lookup data for forms and filters
export type ProductLookups = {
  brands: Brand[]
  categories: Category[]
  genders: Gender[]
  perfumeTypes: PerfumeType[]
  concentrations: Concentration[]
  productLabels: ProductLabel[]
  scents: Scent[]
  ingredients: Ingredient[]
}

