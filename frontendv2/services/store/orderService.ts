import apiClient, { DEFAULT_OPTION_SELLER } from "../api/apiClient"
import type { CommonQueryParams } from "../types/common"

export interface OrderProduct {
  productID: string
  quantity: number
  unitPrice: number
  listedUnitprice: number
  name: string
  note?: string
}

export interface Order {
  _id: string
  customerID: string
  outin: number // 1 for outgoing orders
  type: number // 5 for customer orders
  paymentMethod: string // "1" for COD
  voucherID?: string
  name: string
  note?: string
  total: number
  discount: number
  salesoff: number
  credit: number
  shippingFee: number
  recipientAddress: string
  areaID?: string
  products: OrderProduct[]
  status: number
  createdAt: string
  updatedAt: string
}

export interface CreateOrderData {
  optionSeller: number
  customerID: string
  outin: number // 1 for outgoing orders
  type: number // 5 for customer orders
  paymentMethod: string // "1" for COD
  voucherID?: string
  name: string
  note?: string
  total: number
  discount: number
  salesoff: number
  credit: number
  shippingFee: number
  recipientAddress: string
  areaID?: string
  products: OrderProduct[]
}

export interface OrderQueryParams extends CommonQueryParams {
  customerID?: string
  status?: number
}

class OrderService {
  // Create a new order
  async createOrder(data: CreateOrderData): Promise<Order> {
    try {
      const payload = {
        ...data,
        optionSeller: data.optionSeller || DEFAULT_OPTION_SELLER,
      }

      const response = await apiClient.post<Order>("/api/store/orders/insert-full", payload)
      return response
    } catch (error) {
      console.error("Error creating order:", error)
      throw error
    }
  }

  // Get order by ID
  async getOrderById(orderID: string): Promise<Order> {
    try {
      const response = await apiClient.get<Order>(`/api/store/orders/${orderID}`)
      return response
    } catch (error) {
      console.error("Error fetching order:", error)
      throw error
    }
  }

  // Update order
  async updateOrder(orderID: string, data: Partial<Order>): Promise<Order> {
    try {
      const response = await apiClient.put<Order>(`/api/store/orders/${orderID}`, data)
      return response
    } catch (error) {
      console.error("Error updating order:", error)
      throw error
    }
  }

  // Get orders list
  async getOrders(params?: OrderQueryParams): Promise<Order[]> {
    try {
      const response = await apiClient.get<Order[]>("/api/store/orders", params)
      return response
    } catch (error) {
      console.error("Error fetching orders:", error)
      return []
    }
  }

  // Get customer orders
  async getCustomerOrders(customerID: string, params?: Omit<OrderQueryParams, "customerID">): Promise<Order[]> {
    return this.getOrders({ ...params, customerID })
  }
}

// Create and export a singleton instance
export const orderService = new OrderService()

export default orderService

