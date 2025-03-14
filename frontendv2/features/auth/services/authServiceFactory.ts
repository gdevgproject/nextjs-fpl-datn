import { isMockApi } from "@/config/apiConfig"
import { authMockService } from "../mocks/authMockService"
import { authRealService } from "./authService"
import type { AuthService } from "../types/authTypes"

export function getAuthService(): AuthService {
  return isMockApi() ? authMockService : authRealService
}

// Create and export the service instance
export const authService = getAuthService()

