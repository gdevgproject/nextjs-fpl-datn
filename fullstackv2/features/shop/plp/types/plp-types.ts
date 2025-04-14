// Filter parameters structure based on the filter_products RPC
export interface ProductFilters {
  brand_ids?: number[]
  category_ids?: number[]
  gender_ids?: number[]
  ingredient_ids?: number[]
  label_ids?: number[]
  min_price?: number
  max_price?: number
  on_sale?: boolean
  in_stock?: boolean
  min_volume?: number
  max_volume?: number
  search_term?: string
  origin_country?: string
  release_year_min?: number
  release_year_max?: number
}

// Sort options supported by the filter_products RPC
export type SortOption = "created_at" | "name" | "display_price" | "popularity"
export type SortOrder = "asc" | "desc"

// Filter options from get_plp_filter_options RPC
export interface FilterOptions {
  brands: {
    id: number
    name: string
    count: number
  }[]
  categories: {
    id: number
    name: string
    count: number
  }[]
  genders: {
    id: number
    name: string
    count: number
  }[]
  ingredients: {
    id: number
    name: string
    count: number
  }[]
  labels: {
    id: number
    name: string
    count: number
  }[]
  price_range: {
    min: number
    max: number
  }
  volumes: {
    value: number
    count: number
  }[]
  origin_countries: {
    value: string
    count: number
  }[]
  release_years: {
    value: number
    count: number
  }[]
}

// Product response from filter_products RPC
export interface ProductListItem {
  id: number
  name: string
  slug: string
  short_description: string | null
  brand_id: number | null
  brand_name: string | null
  gender_id: number | null
  gender_name: string | null
  concentration_id: number | null
  concentration_name: string | null
  perfume_type_id: number | null
  perfume_type_name: string | null
  origin_country: string | null
  release_year: number | null
  main_image_url: string | null
  min_price: number
  max_price: number
  min_sale_price: number | null
  max_sale_price: number | null
  is_on_sale: boolean
  is_in_stock: boolean
  total_count: number
}

// Sort option display data
export interface SortOptionDisplay {
  value: SortOption
  label: string
  defaultOrder: SortOrder
}

export const SORT_OPTIONS: SortOptionDisplay[] = [
  { value: "popularity", label: "Phổ biến", defaultOrder: "desc" },
  { value: "created_at", label: "Mới nhất", defaultOrder: "desc" },
  { value: "name", label: "Tên", defaultOrder: "asc" },
  { value: "display_price", label: "Giá: Thấp đến cao", defaultOrder: "asc" },
  { value: "display_price", label: "Giá: Cao đến thấp", defaultOrder: "desc" },
]
