// Types for search feature
export interface SearchResult {
  id: string
  name: string
  price: number
  image: string
  unit: string
}

export interface SearchQuery {
  query: string
  limit?: number
}

export interface SearchService {
  searchProducts(params: SearchQuery): Promise<SearchResult[]>
}

