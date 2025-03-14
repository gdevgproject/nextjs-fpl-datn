// Types for trusted shop feature
export interface TrustedShop {
  id: string
  name: string
  slug: string
  description: string
  address: string
  phone: string
  email: string
  website?: string
  openingHours: string
  image: string
  rating: number
  reviewCount: number
  location: {
    lat: number
    lng: number
  }
}

export interface TrustedShopListParams {
  search?: string
  sort?: string
  page?: number
  limit?: number
}

export interface TrustedShopListResponse {
  shops: TrustedShop[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TrustedShopService {
  getTrustedShops(params?: TrustedShopListParams): Promise<TrustedShopListResponse>
  getTrustedShopBySlug(slug: string): Promise<TrustedShop>
}

