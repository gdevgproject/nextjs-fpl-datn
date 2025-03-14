import type { ProductService, Product, ProductListParams, ProductListResponse } from "../types/productTypes"

// Mock product data
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Viên uống NutriGrow Nutrimed bổ sung canxi, vitamin D3",
    slug: "vien-uong-nutrigrow-nutrimed-bo-sung-canxi-vitamin-d3",
    description: "Viên uống bổ sung canxi và vitamin D3 giúp xương chắc khỏe",
    price: 480000,
    originalPrice: 600000,
    images: ["/placeholder.svg"],
    category: "vitamin",
    tags: ["canxi", "vitamin-d3", "xuong-khop"],
    inStock: true,
    rating: 4.8,
    reviewCount: 120,
  },
  {
    id: "2",
    name: "Viên uống Rama Bổ Phổi hỗ trợ bổ phổi, giảm ho hiệu quả",
    slug: "vien-uong-rama-bo-phoi-ho-tro-bo-phoi-giam-ho-hieu-qua",
    description: "Viên uống hỗ trợ bổ phổi, giảm ho hiệu quả",
    price: 155000,
    originalPrice: 200000,
    images: ["/placeholder.svg"],
    category: "ho-tro-dieu-tri",
    tags: ["ho", "phoi", "duong-ho-hap"],
    inStock: true,
    rating: 4.5,
    reviewCount: 85,
  },
  // Add more mock products as needed
]

export class ProductMockService implements ProductService {
  async getProducts(params?: ProductListParams): Promise<ProductListResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    let filteredProducts = [...mockProducts]

    // Apply filters
    if (params?.category) {
      filteredProducts = filteredProducts.filter((p) => p.category === params.category)
    }

    if (params?.search) {
      const searchLower = params.search.toLowerCase()
      filteredProducts = filteredProducts.filter(
        (p) => p.name.toLowerCase().includes(searchLower) || p.description.toLowerCase().includes(searchLower),
      )
    }

    // Apply sorting
    if (params?.sort) {
      switch (params.sort) {
        case "price-asc":
          filteredProducts.sort((a, b) => a.price - b.price)
          break
        case "price-desc":
          filteredProducts.sort((a, b) => b.price - a.price)
          break
        case "name-asc":
          filteredProducts.sort((a, b) => a.name.localeCompare(b.name))
          break
        case "name-desc":
          filteredProducts.sort((a, b) => b.name.localeCompare(a.name))
          break
        default:
          // Default sorting by id
          break
      }
    }

    // Apply pagination
    const page = params?.page || 1
    const limit = params?.limit || 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

    return {
      products: paginatedProducts,
      total: filteredProducts.length,
      page,
      limit,
      totalPages: Math.ceil(filteredProducts.length / limit),
    }
  }

  async getProductBySlug(slug: string): Promise<Product> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const product = mockProducts.find((p) => p.slug === slug)

    if (!product) {
      throw new Error(`Product with slug "${slug}" not found`)
    }

    return product
  }
}

// Export a singleton instance
export const productMockService = new ProductMockService()

