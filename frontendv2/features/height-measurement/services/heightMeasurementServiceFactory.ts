import { isMockApi } from "@/config/apiConfig"
import { heightMeasurementMockService } from "../mocks/heightMeasurementMockService"
import { heightMeasurementRealService } from "./heightMeasurementService"
import type { HeightMeasurementService } from "../types/heightMeasurementTypes"

export function getHeightMeasurementService(): HeightMeasurementService {
  const service = isMockApi() ? heightMeasurementMockService : heightMeasurementRealService
  console.log(`🔧 Height Measurement Service: ${isMockApi() ? "MOCK" : "REAL"}`)
  return service
}

// Tạo và export instance service
export const heightMeasurementService = getHeightMeasurementService()

