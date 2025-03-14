import axios from "axios"
import type { OrderService, Order, CreateOrderRequest } from "../types/orderTypes"

export class OrderRealService implements OrderService {
  async getOrders(): Promise<Order[]> {
    const response = await axios.get("/api/orders")
    return response.data
  }

  async getOrderById(orderId: string): Promise<Order> {
    const response = await axios.get(`/api/orders/${orderId}`)
    return response.data
  }

  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    const response = await axios.post("/api/orders", orderData)
    return response.data
  }
}

// Export a singleton instance
export const orderRealService = new OrderRealService()

