// Types liên quan đến đơn hàng, thanh toán
export interface Order {
  id: number
  user_id: string | null
  // Guest information
  guest_name: string | null
  guest_email: string | null
  guest_phone: string | null
  // Address information
  recipient_name: string
  recipient_phone: string
  province_city: string
  district: string
  ward: string
  street_address: string
  // Order details
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
  discount?: Discount
  items?: OrderItem[]
  payments?: Payment[]
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

export interface Discount {
  id: number
  code: string
  description: string | null
  start_date: string | null
  end_date: string | null
  max_uses: number | null
  remaining_uses: number | null
  min_order_value: number | null
  max_discount_amount: number | null
  discount_percentage: number | null
  is_active: boolean
  created_at: string
  updated_at: string | null
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

  // Relations
  variant?: ProductVariant
}

export interface Payment {
  id: number
  order_id: number
  payment_date: string
  payment_method_id: number | null
  transaction_id: string | null
  amount: number
  status: "Pending" | "Completed" | "Failed" | "Refunded"
  payment_details: Record<string, any> | null
  created_at: string
  updated_at: string | null

  // Relations
  payment_method?: PaymentMethod
}

// Import ProductVariant để tránh lỗi
import type { ProductVariant } from "./product-types"

