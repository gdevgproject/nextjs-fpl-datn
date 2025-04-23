export type Role = "user" | "assistant" | "system"

export interface Message {
  id: string
  role: Role
  content: string
  createdAt: Date
}

export interface ChatSession {
  id: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface ProductRecommendation {
  id: number
  name: string
  slug: string
  image_url: string
  price: number
  sale_price: number | null
  brand_name?: string
}

export interface ChatContextValue {
  messages: Message[]
  isLoading: boolean
  error: Error | null
  sendMessage: (content: string) => Promise<void>
  resetChat: () => void
}

export interface ProductSearchParams {
  query: string
  limit?: number
}

export interface ProductSearchResult {
  products: ProductRecommendation[]
  totalCount: number
}

// Simplified product type for AI context
export interface AIProduct {
  id: number
  name: string
  slug: string
  short_description: string | null
  brand_name: string | null
  gender_name: string | null
  concentration_name: string | null
  price: number
  sale_price: number | null
  volume_ml: number
  scents: string[]
  ingredients: string[]
}
