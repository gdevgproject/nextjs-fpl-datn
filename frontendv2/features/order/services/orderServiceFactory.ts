import { isMockApi } from "@/config/apiConfig"
import { orderMockService } from "../mocks/orderMockService"
import { orderRealService } from "./orderService"
import type { OrderService } from "../types/orderTypes"

export function getOrderService(): OrderService {
  return isMockApi() ? orderMockService : orderRealService
}

// Create and export the service instance
export const orderService = getOrderService()

