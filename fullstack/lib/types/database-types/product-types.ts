// Types liên quan đến sản phẩm, danh mục, thương hiệu
export interface Product {
  id: number
  name: string
  slug: string
  product_code: string | null
  short_description: string | null
  long_description: string | null
  brand_id: number | null
  gender_id: number | null
  perfume_type_id: number | null
  concentration_id: number | null
  origin_country: string | null
  release_year: number | null
  style: string | null
  sillage: string | null
  longevity: string | null
  created_at: string
  updated_at: string | null
  deleted_at: string | null

  // Relations
  brand?: Brand
  gender?: Gender
  perfume_type?: PerfumeType
  concentration?: Concentration
  images?: ProductImage[]
  variants?: ProductVariant[]
  categories?: Category[]
  scents?: ProductScent[]
  ingredients?: ProductIngredient[]
  labels?: ProductLabelAssignment[]
}

export interface Brand {
  id: number
  name: string
  description: string | null
  logo_url: string | null
  created_at: string
  updated_at: string | null
}

export interface Gender {
  id: number
  name: string
  created_at: string
  updated_at: string | null
}

export interface PerfumeType {
  id: number
  name: string
  created_at: string
  updated_at: string | null
}

export interface Concentration {
  id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string | null
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  is_featured: boolean
  display_order: number
  parent_category_id: number | null
  created_at: string
  updated_at: string | null
}

export interface ProductImage {
  id: number
  product_id: number
  image_url: string
  alt_text: string | null
  is_main: boolean
  display_order: number
  created_at: string
  updated_at: string | null
}

export interface ProductVariant {
  id: number
  product_id: number
  volume_ml: number
  price: number
  sale_price: number | null
  sku: string | null
  stock_quantity: number
  created_at: string
  updated_at: string | null
  deleted_at: string | null
}

export interface Scent {
  id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string | null
}

export interface ProductScent {
  id: number
  product_id: number
  scent_id: number
  scent_type: "top" | "middle" | "base"
  scent?: Scent
}

export interface Ingredient {
  id: number
  name: string
  created_at: string
  updated_at: string | null
}

export interface ProductIngredient {
  id: number
  product_id: number
  ingredient_id: number
  ingredient?: Ingredient
}

export interface ProductLabel {
  id: number
  name: string
  color_code: string | null
  created_at: string
  updated_at: string | null
}

export interface ProductLabelAssignment {
  id: number
  product_id: number
  label_id: number
  valid_until: string | null
  label?: ProductLabel
}

