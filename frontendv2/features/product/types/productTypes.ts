export interface ProductImage {
  id: string
  url: string
  alt: string
}

export interface ProductVariant {
  id: string
  name: string
  price: number
  originalPrice?: number
  inStock: boolean
  specification?: string
}

export interface ProductPromotion {
  id: string
  type: "discount" | "gift" | "other"
  title: string
  description: string
  discountPercent?: number
  validUntil?: string
}

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  shortDescription: string // Added field
  features?: string
  images: ProductImage[]
  code: string
  registrationNumber: string // Added field
  variants: ProductVariant[]
  currentVariant?: ProductVariant
  brand: string
  origin: string
  manufacturer: string
  manufacturingCountry: string // Added field
  specification: string
  usage: string
  ingredients: string
  ingredientsDescription: string
  storage: string
  categoryId: string
  category?: {
    id: string
    name: string
    slug: string
  }
  dosageForm: string // Added field
  rating: number
  reviewCount: number
  commentCount: number
  rewardPoints: number
  inStock: boolean
  tags: string[]
  promotions?: ProductPromotion[]
  unit?: string
}

export interface ProductListParams {
  category?: string
  search?: string
  sort?: "price-asc" | "price-desc" | "name-asc" | "name-desc" | "rating-asc" | "rating-desc"
  page?: number
  limit?: number
}

export interface ProductListResponse {
  products: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ProductReview {
  id: string
  rating: number
  content: string
  author: {
    name: string
  }
  createdAt: string
  likes: number
  verified: boolean
}

export interface ProductQuestion {
  id: string
  question: string
  answer: string
  author: {
    name: string
  }
  createdAt: string
  answered: boolean
}

export interface ProductService {
  getProducts(params?: ProductListParams): Promise<ProductListResponse>
  getProductBySlug(slug: string): Promise<Product>
}

