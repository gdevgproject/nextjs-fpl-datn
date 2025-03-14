import axios from "axios"
import type { SearchQuery, SearchResult, SearchService } from "../types/searchTypes"

export class SearchRealService implements SearchService {
  async searchProducts(params: SearchQuery): Promise<SearchResult[]> {
    const response = await axios.get("/api/search", { params })
    return response.data
  }
}

// Export a singleton instance
export const searchRealService = new SearchRealService()

