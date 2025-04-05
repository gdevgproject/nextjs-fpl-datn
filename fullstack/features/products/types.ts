import type { Brand } from "../brands/types";
import type { Category } from "../categories/types";

/**
 * Product interface
 */
export interface Product {
  id: number;
  name: string;
  slug: string;
  product_code?: string;
  short_description?: string | null;
  long_description?: string | null;
  brand_id: number | null;
  gender_id: number | null;
  perfume_type_id: number | null;
  concentration_id: number | null;
  origin_country?: string;
  release_year?: number;
  style?: string;
  sillage?: string;
  longevity?: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  // Related entities
  brand?: Brand;
  gender?: Gender;
  perfume_type?: PerfumeType;
  concentration?: Concentration;
  images?: ProductImage[];
  variants?: ProductVariant[];
  categories?: Category[];

  // Calculated fields
  price?: number;
  sale_price?: number | null;
  total_sold?: number;
  main_image_url?: string | null;
}

/**
 * Product variant
 */
export interface ProductVariant {
  id: number;
  product_id: number;
  volume_ml: number;
  price: number;
  sale_price: number | null;
  sku: string;
  stock_quantity: number;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  product?: Product;
}

/**
 * Product image
 */
export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text?: string;
  is_main: boolean;
  display_order: number;
  created_at: string;
  updated_at: string | null;
}

/**
 * Gender
 */
export interface Gender {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

/**
 * Perfume type
 */
export interface PerfumeType {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

/**
 * Concentration
 */
export interface Concentration {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Scent
 */
export interface Scent {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Product-Scent relationship
 */
export interface ProductScent {
  scent: Scent;
  scent_type: "top" | "middle" | "base";
}

/**
 * Ingredient
 */
export interface Ingredient {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

/**
 * Product-Ingredient relationship
 */
export interface ProductIngredient {
  ingredient: Ingredient;
}

/**
 * Product filter options
 */
export interface ProductFilter {
  search?: string;
  category?: string;
  brand?: string;
  gender?: string;
  perfume_type?: string;
  concentration?: string;
  price_min?: number;
  price_max?: number;
  sortBy?: string;
}
