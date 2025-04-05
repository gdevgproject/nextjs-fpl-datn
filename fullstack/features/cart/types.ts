// Cart item type
export interface CartItem {
  id: string | number
  variant_id: number
  quantity: number
  product?: {
    id: number | string
    name: string
    slug: string
    price: number
    sale_price: number | null
    volume_ml: number
    images: any[]
  }
}

// Discount type
export interface Discount {
  id: number
  code: string
  description?: string
  start_date?: string
  end_date?: string
  max_uses?: number
  remaining_uses?: number
  min_order_value?: number
  max_discount_amount?: number
  discount_percentage: number
  is_active: boolean
}

// Cart state type
export interface CartState {
  cartItems: CartItem[]
  cartItemCount: number
  subtotal: number
  discount: number
  shippingFee: number
  cartTotal: number
  discountCode?: string
  appliedDiscount: Discount | null
  isUpdatingCart?: boolean
  isLoading?: boolean
}

// Guest checkout info
export interface GuestCheckoutInfo {
  name: string
  email: string
  phone: string
}

// Order data for checkout
export interface OrderData {
  customerInfo: {
    fullName: string
    email: string
    phoneNumber: string
    address: string
    ward: string
    district: string
    province: string
    note?: string
  }
  paymentMethod: number
  shippingMethod: string
  subtotal: number
  discount: number
  shippingFee: number
  total: number
  discountCode?: string
  items: {
    productVariantId: number
    quantity: number
    price: number
  }[]
}

// Order response
export interface OrderResponse {
  orderId?: number
  error?: string
}

