export type UserRole = "admin" | "staff" | "authenticated" | "anon"

export interface Profile {
  id: string
  display_name: string | null
  phone_number: string | null
  gender: string | null
  birth_date: string | null
  avatar_url: string | null
  default_address_id: number | null
  created_at: string
  updated_at: string | null
  role: UserRole | null
}

export interface Address {
  id: number
  user_id: string
  recipient_name: string
  recipient_phone: string
  province_city: string
  district: string
  ward: string
  street_address: string
  postal_code: string | null
  is_default: boolean
  created_at: string
  updated_at: string | null
}

export interface Product {
  id: number
  name: string
  slug: string
  product_code?: string | null
  short_description?: string | null
  long_description?: string | null
  brand_id?: number | null
  gender_id?: number | null
  perfume_type_id?: number | null
  concentration_id?: number | null
  origin_country?: string | null
  release_year?: number | null
  style?: string | null
  sillage?: string | null
  longevity?: string | null
  created_at: string
  updated_at: string | null
  deleted_at: string | null

  // Calculated fields from variants
  price: number
  sale_price: number | null

  // Relations
  brand?: Brand
  gender?: Gender
  perfume_type?: PerfumeType
  concentration?: Concentration
  images?: ProductImage[]
  variants?: ProductVariant[]
  categories?: { categories: Category }[]
  labels?: { label: ProductLabel }[]
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

export interface ProductImage {
  id: number
  product_id: number
  image_url: string
  alt_text?: string | null
  is_main: boolean
  display_order: number
  created_at: string
  updated_at: string | null
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

export interface ProductLabel {
  id: number
  name: string
  color_code: string | null
  created_at: string
  updated_at: string | null
}

export interface CartItem {
  id: string
  cart_id: number
  variant_id: number
  quantity: number
  created_at: string
  updated_at: string | null

  // Relations
  variant?: ProductVariant
}

export interface Order {
  id: number
  user_id: string | null
  guest_name: string | null
  guest_email: string | null
  guest_phone: string | null
  recipient_name: string
  recipient_phone: string
  province_city: string
  district: string
  ward: string
  street_address: string
  order_date: string
  delivery_notes: string | null
  payment_method_id: number | null
  payment_status: "Pending" | "Paid" | "Failed" | "Refunded"
  order_status_id: number | null
  tracking_number: string | null
  discount_id: number | null
  subtotal_amount: number
  discount_amount: number
  shipping_fee: number
  total_amount: number
  created_at: string
  updated_at: string | null

  // Relations
  order_status?: OrderStatus
  payment_method?: PaymentMethod
  items?: OrderItem[]
}

export interface OrderStatus {
  id: number
  name: string
}

export interface PaymentMethod {
  id: number
  name: string
  description: string | null
  is_active: boolean
}

export interface OrderItem {
  id: number
  order_id: number
  variant_id: number
  product_name: string
  variant_volume_ml: number
  quantity: number
  unit_price_at_order: number
  created_at: string
  updated_at: string | null
}

export interface Banner {
  id: number
  title: string
  subtitle: string | null
  image_url: string
  link_url: string | null
  is_active: boolean
  display_order: number
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string | null
}

