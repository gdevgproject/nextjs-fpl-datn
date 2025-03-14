import { isMockApi } from "@/config/apiConfig"
import { trustedShopMockService } from "../mocks/trustedShopMockService"
import { trustedShopRealService } from "./trustedShopService"
import type { TrustedShopService } from "../types/trustedShopTypes"

export function getTrustedShopService(): TrustedShopService {
  return isMockApi() ? trustedShopMockService : trustedShopRealService
}

// Create and export the service instance
export const trustedShopService = getTrustedShopService()

