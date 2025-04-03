export type UserRole = "admin" | "staff" | "authenticated" | "anon"

export interface Profile {
  id: string
  display_name: string | null
  phone_number: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string | null
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  sale_price: number | null
  stock_quantity: number
  brand_id: string | null
  gender: string | null
  concentration: string | null
  perfume_type: string | null
  is_featured: boolean
  is_published: boolean
  created_at: string
  updated_at: string | null
  deleted_at: string | null
  brand?: Brand
  images?: ProductImage[]
  categories?: Category[]
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  is_main: boolean
  display_order: number
  created_at: string
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo_url: string | null
  description: string | null
  created_at: string
  updated_at: string | null
}

export interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  display_order: number
  created_at: string
  updated_at: string | null
}

export interface CartItem {
  id: string
  product_id: string
  quantity: number
  product: Product
}

export interface Order {
  id: string
  user_id: string | null
  order_status_id: string
  payment_method_id: string
  payment_status: string
  shipping_address_id: string | null
  guest_name: string | null
  guest_email: string | null
  guest_phone: string | null
  guest_address: string | null
  total_amount: number
  shipping_fee: number
  discount_amount: number
  tracking_number: string | null
  notes: string | null
  order_date: string
  created_at: string
  updated_at: string | null
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  product_name: string
  product_image_url: string | null
  created_at: string
}

