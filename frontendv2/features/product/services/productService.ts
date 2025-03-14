import { apiClient, DEFAULT_OPTION_SELLER } from "@/services/api/apiClient"
import type { ProductService, Product, ProductListParams, ProductListResponse } from "../types/productTypes"

export class ProductRealService implements ProductService {
  async getProducts(params?: ProductListParams): Promise<ProductListResponse> {
    try {
      // Thêm các tham số mặc định theo tài liệu API
      const apiParams = {
        optionSeller: DEFAULT_OPTION_SELLER,
        usage: 2, // Theo tài liệu API
        ...params,
      }

      const response = await apiClient.get("/api/item/goods", apiParams)
      return response
    } catch (error) {
      console.error("Error fetching products:", error)
      throw error
    }
  }

  async getProductBySlug(slug: string): Promise<Product> {
    try {
      // Theo tài liệu API, truyền slug như một tham số
      const response = await apiClient.get(`/api/item/goods`, { slug })
      return response
    } catch (error) {
      console.error(`Error fetching product by slug ${slug}:`, error)
      throw error
    }
  }
}

// Export a singleton instance
export const productRealService = new ProductRealService()

