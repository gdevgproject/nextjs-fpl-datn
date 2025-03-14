import { isMockApi } from "@/config/apiConfig"
import { nutritionCheckMockService } from "../mocks/nutritionCheckMockService"
import { nutritionCheckRealService } from "./nutritionCheckService"
import type { NutritionCheckService } from "../types/nutritionCheckTypes"

export function getNutritionCheckService(): NutritionCheckService {
  return isMockApi() ? nutritionCheckMockService : nutritionCheckRealService
}

// Create and export the service instance
export const nutritionCheckService = getNutritionCheckService()

