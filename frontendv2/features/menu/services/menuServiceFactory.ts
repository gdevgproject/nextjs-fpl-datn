import { isMockApi } from "@/config/apiConfig"
import { menuMockService } from "../mocks/menuMockService"
import { menuRealService } from "./menuService"
import type { MenuService } from "../types/menuTypes"

export function getMenuService(): MenuService {
  return isMockApi() ? menuMockService : menuRealService
}

// Create and export the service instance
export const menuService = getMenuService()

