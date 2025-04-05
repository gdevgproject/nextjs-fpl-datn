// Types for the homepage based on the database schema

// Basic types
export type UUID = string;
export type Timestamp = string;

// Product related types
export interface Product {
  id: number;
  name: string;
  slug: string;
  product_code?: string;
  short_description?: string;
  long_description?: string;
  brand_id: number | null;
  gender_id: number | null;
  perfume_type_id: number | null;
  concentration_id: number | null;
  origin_country?: string;
  release_year?: number;
  style?: string;
  sillage?: string;
  longevity?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
  deleted_at: Timestamp | null;

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
}

export interface ProductVariant {
  id: number;
  product_id: number;
  volume_ml: number;
  price: number;
  sale_price: number | null;
  sku: string;
  stock_quantity: number;
  created_at: Timestamp;
  updated_at: Timestamp | null;
  deleted_at: Timestamp | null;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text?: string;
  is_main: boolean;
  display_order: number;
  created_at: Timestamp;
  updated_at: Timestamp | null;
}

export interface Brand {
  id: number;
  name: string;
  description?: string;
  logo_url?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Gender {
  id: number;
  name: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface PerfumeType {
  id: number;
  name: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Concentration {
  id: number;
  name: string;
  description?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_featured: boolean;
  display_order: number;
  parent_category_id: number | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ProductLabel {
  id: number;
  name: string;
  color_code?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ProductLabelAssignment {
  id: number;
  product_id: number;
  label_id: number;
  valid_until?: Timestamp;
}

// Banner related types
export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  is_active: boolean;
  display_order: number;
  start_date: Timestamp | null;
  end_date: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Shopping related types
export interface ShoppingCart {
  id: number;
  user_id: UUID;
  created_at: Timestamp;
  updated_at: Timestamp;
  items?: CartItem[];
}

export interface CartItem {
  id: number;
  cart_id: number;
  variant_id: number;
  quantity: number;
  created_at: Timestamp;
  updated_at: Timestamp;
  variant?: ProductVariant;
  product?: Product;
}

// Order related types
export interface Order {
  id: number;
  user_id: UUID | null;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  recipient_name: string;
  recipient_phone: string;
  province_city: string;
  district: string;
  ward: string;
  street_address: string;
  order_date: Timestamp;
  delivery_notes?: string;
  payment_method_id?: number;
  payment_status: "Pending" | "Paid" | "Failed" | "Refunded";
  order_status_id?: number;
  tracking_number?: string;
  discount_id?: number;
  subtotal_amount: number;
  discount_amount: number;
  shipping_fee: number;
  total_amount: number;
  created_at: Timestamp;
  updated_at: Timestamp;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  variant_id: number;
  product_name: string;
  variant_volume_ml: number;
  quantity: number;
  unit_price_at_order: number;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Review related types
export interface Review {
  id: number;
  product_id: number;
  user_id: UUID;
  order_item_id?: number;
  rating: number;
  comment?: string;
  is_approved: boolean;
  approved_by?: UUID;
  approved_at?: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
  replies?: ReviewReply[];
}

export interface ReviewReply {
  id: number;
  review_id: number;
  staff_id: UUID;
  reply_text: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// User related types
export interface Profile {
  id: UUID;
  display_name?: string;
  phone_number?: string;
  gender?: string;
  birth_date?: string;
  avatar_url?: string;
  default_address_id?: number;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Address {
  id: number;
  user_id: UUID;
  recipient_name: string;
  recipient_phone: string;
  province_city: string;
  district: string;
  ward: string;
  street_address: string;
  postal_code?: string;
  is_default: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}
