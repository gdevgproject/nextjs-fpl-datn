import type { SearchQuery, SearchResult, SearchService } from "../types/searchTypes"

// Mock search results
const mockSearchResults: SearchResult[] = [
  {
    id: "1",
    name: "Hỗn dịch uống men vi sinh Enterogermina Gut Defense Sanofi tăng cường tiêu hóa",
    price: 165000,
    image: "/placeholder.svg?height=48&width=48",
    unit: "Hộp",
  },
  {
    id: "2",
    name: "Hỗn dịch uống men vi sinh Enterogermina Gut Defense Sanofi tăng cường tiêu hóa",
    price: 165000,
    image: "/placeholder.svg?height=48&width=48",
    unit: "Hộp",
  },
  {
    id: "3",
    name: "Hỗn dịch uống men vi sinh Enterogermina Gut Defense Sanofi tăng cường tiêu hóa",
    price: 165000,
    image: "/placeholder.svg?height=48&width=48",
    unit: "Hộp",
  },
]

export class SearchMockService implements SearchService {
  async searchProducts(params: SearchQuery): Promise<SearchResult[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    if (!params.query) return []

    // Filter results based on query
    return mockSearchResults
      .filter((item) => item.name.toLowerCase().includes(params.query.toLowerCase()))
      .slice(0, params.limit || 10)
  }
}

// Export a singleton instance
export const searchMockService = new SearchMockService()

