import type {
  TrustedShopService,
  TrustedShop,
  TrustedShopListParams,
  TrustedShopListResponse,
} from "../types/trustedShopTypes"

// Mock trusted shop data
const mockTrustedShops: TrustedShop[] = [
  {
    id: "1",
    name: "Nhà thuốc Elena 1",
    slug: "nha-thuoc-elena-1",
    description: "Nhà thuốc uy tín hàng đầu tại Hà Nội",
    address: "30 Vĩnh Phúc, Ba Đình, Hà Nội",
    phone: "0987654321",
    email: "elena1@example.com",
    website: "https://elena1.example.com",
    openingHours: "8:00 - 22:00",
    image: "/placeholder.svg?height=80&width=160",
    rating: 4.8,
    reviewCount: 120,
    location: {
      lat: 21.0285,
      lng: 105.8542,
    },
  },
  {
    id: "2",
    name: "Nhà thuốc Elena 2",
    slug: "nha-thuoc-elena-2",
    description: "Nhà thuốc uy tín hàng đầu tại Hồ Chí Minh",
    address: "123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
    phone: "0987654322",
    email: "elena2@example.com",
    website: "https://elena2.example.com",
    openingHours: "8:00 - 22:00",
    image: "/placeholder.svg?height=80&width=160",
    rating: 4.7,
    reviewCount: 110,
    location: {
      lat: 10.7769,
      lng: 106.7009,
    },
  },
  // Add more mock trusted shops as needed
]

export class TrustedShopMockService implements TrustedShopService {
  async getTrustedShops(params?: TrustedShopListParams): Promise<TrustedShopListResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    let filteredShops = [...mockTrustedShops]

    // Apply filters
    if (params?.search) {
      const searchLower = params.search.toLowerCase()
      filteredShops = filteredShops.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.description.toLowerCase().includes(searchLower) ||
          s.address.toLowerCase().includes(searchLower),
      )
    }

    // Apply sorting
    if (params?.sort) {
      switch (params.sort) {
        case "rating-asc":
          filteredShops.sort((a, b) => a.rating - b.rating)
          break
        case "rating-desc":
          filteredShops.sort((a, b) => b.rating - a.rating)
          break
        case "name-asc":
          filteredShops.sort((a, b) => a.name.localeCompare(b.name))
          break
        case "name-desc":
          filteredShops.sort((a, b) => b.name.localeCompare(a.name))
          break
        default:
          // Default sorting by rating desc
          filteredShops.sort((a, b) => b.rating - a.rating)
          break
      }
    } else {
      // Default sorting by rating desc
      filteredShops.sort((a, b) => b.rating - a.rating)
    }

    // Apply pagination
    const page = params?.page || 1
    const limit = params?.limit || 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedShops = filteredShops.slice(startIndex, endIndex)

    return {
      shops: paginatedShops,
      total: filteredShops.length,
      page,
      limit,
      totalPages: Math.ceil(filteredShops.length / limit),
    }
  }

  async getTrustedShopBySlug(slug: string): Promise<TrustedShop> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const shop = mockTrustedShops.find((s) => s.slug === slug)

    if (!shop) {
      throw new Error(`Trusted shop with slug "${slug}" not found`)
    }

    return shop
  }
}

// Export a singleton instance
export const trustedShopMockService = new TrustedShopMockService()

