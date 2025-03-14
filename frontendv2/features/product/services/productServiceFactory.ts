import { isMockApi } from "@/config/apiConfig"
import { productMockService } from "../mocks/productMockService"
import { productRealService } from "./productService"
import type { ProductService } from "../types/productTypes"

export function getProductService(): ProductService {
  return isMockApi() ? productMockService : productRealService
}

// Create and export the service instance
export const productService = getProductService()

