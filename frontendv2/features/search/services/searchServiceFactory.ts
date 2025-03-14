import { isMockApi } from "@/config/apiConfig"
import { searchMockService } from "../mocks/searchMockService"
import { searchRealService } from "./searchService"
import type { SearchService } from "../types/searchTypes"

export function getSearchService(): SearchService {
  return isMockApi() ? searchMockService : searchRealService
}

// Create and export the service instance
export const searchService = getSearchService()

