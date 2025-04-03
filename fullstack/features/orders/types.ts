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

  // Joined data
  variant?: {
    product_id: number
    volume_ml: number
    price: number
    sale_price: number | null
    products?: {
      id: number
      name: string
      slug: string
      images?: {
        id: number
        image_url: string
        is_main: boolean
      }[]
    }
  }
}

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

  // Joined data
  order_status?: OrderStatus
  payment_method?: PaymentMethod
  items?: OrderItem[]
}

export interface OrderFilter {
  status?: number | null
  dateRange?: {
    from: Date | null
    to: Date | null
  } | null
}

export interface OrdersResponse {
  data: Order[]
  count: number
}

