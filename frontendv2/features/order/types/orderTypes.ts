// Types for order feature
export interface OrderItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  totalItems: number
  totalPrice: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  shippingAddress: {
    fullName: string
    address: string
    city: string
    postalCode: string
    country: string
    phone: string
  }
  paymentMethod: "cod" | "bank_transfer" | "credit_card" | "momo" | "zalopay"
  createdAt: string
  updatedAt: string
}

export interface CreateOrderRequest {
  items: {
    productId: string
    quantity: number
  }[]
  shippingAddress: {
    fullName: string
    address: string
    city: string
    postalCode: string
    country: string
    phone: string
  }
  paymentMethod: "cod" | "bank_transfer" | "credit_card" | "momo" | "zalopay"
}

export interface OrderService {
  getOrders(): Promise<Order[]>
  getOrderById(orderId: string): Promise<Order>
  createOrder(orderData: CreateOrderRequest): Promise<Order>
}

