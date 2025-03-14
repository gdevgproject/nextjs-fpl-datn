import apiClient, { DEFAULT_OPTION_SELLER } from "../api/apiClient"
import type { CommonQueryParams } from "../types/common"

export interface SearchKeyword {
  _id: string
  keyword: string
  count: number
  createdAt: string
  updatedAt: string
}

export interface SearchKeywordParams extends CommonQueryParams {
  keyword?: string
}

class SearchKeywordService {
  // Get popular search keywords
  async getPopularKeywords(params?: Omit<SearchKeywordParams, "keyword">): Promise<SearchKeyword[]> {
    try {
      const queryParams = {
        optionSeller: DEFAULT_OPTION_SELLER,
        ...params,
      }

      const response = await apiClient.get<SearchKeyword[]>("/api/crm/search_keyword", queryParams, false)
      return response
    } catch (error) {
      console.error("Error fetching popular keywords:", error)
      return []
    }
  }

  // Update search keyword (increment count)
  async updateKeyword(keyword: string): Promise<boolean> {
    try {
      const params = {
        optionSeller: DEFAULT_OPTION_SELLER,
        keyword,
      }

      await apiClient.put("/api/crm/search_keyword", params, false)
      return true
    } catch (error) {
      console.error("Error updating search keyword:", error)
      return false
    }
  }
}

// Create and export a singleton instance
export const searchKeywordService = new SearchKeywordService()

export default searchKeywordService

