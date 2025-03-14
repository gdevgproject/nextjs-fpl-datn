import apiClient, { DEFAULT_OPTION_SELLER } from "../api/apiClient"
import type { CommonQueryParams } from "../types/common"
import type { FileInfo } from "../types/common"

export interface Goods {
  _id: string
  name: string
  slug: string
  description?: string
  content?: string
  sign?: string
  unit?: string
  sellingUnitprice: number
  listedUnitprice?: number
  images?: FileInfo[]
  category?: any
  categoryID?: string
  tags?: string[]
  status: number
  createdAt: string
  updatedAt: string
}

export interface CreateGoodsData {
  name: string
  slug?: string
  description?: string
  content?: string
  sign?: string
  unit?: string
  sellingUnitprice: number
  listedUnitprice?: number
  images?: string[] // Array of image IDs
  categoryID?: string
  tags?: string[]
  status?: number
}

export interface GoodsQueryParams extends CommonQueryParams {
  categoryID?: string
  keyword?: string
  usage?: number // 2 for product list
  status?: number
}

class GoodsService {
  // Create a new product
  async createGoods(data: CreateGoodsData): Promise<Goods> {
    try {
      const response = await apiClient.post<Goods>("/api/item/goods", data)
      return response
    } catch (error) {
      console.error("Error creating product:", error)
      throw error
    }
  }

  // Get product by ID
  async getGoodsById(goodsID: string): Promise<Goods> {
    try {
      const response = await apiClient.get<Goods>(`/api/item/goods/${goodsID}`)
      return response
    } catch (error) {
      console.error("Error fetching product:", error)
      throw error
    }
  }

  // Get product by slug
  async getGoodsBySlug(slug: string): Promise<Goods> {
    try {
      const response = await apiClient.get<Goods>(`/api/item/goods?slug=${slug}`)
      return response
    } catch (error) {
      console.error("Error fetching product by slug:", error)
      throw error
    }
  }

  // Update product
  async updateGoods(goodsID: string, data: Partial<CreateGoodsData>): Promise<Goods> {
    try {
      const response = await apiClient.put<Goods>(`/api/item/goods/${goodsID}`, data)
      return response
    } catch (error) {
      console.error("Error updating product:", error)
      throw error
    }
  }

  // Get products list
  async getGoodsList(params?: GoodsQueryParams): Promise<Goods[]> {
    try {
      const queryParams = {
        optionSeller: DEFAULT_OPTION_SELLER,
        usage: 2,
        ...params,
      }

      const response = await apiClient.get<Goods[]>("/api/item/goods", queryParams)
      return response
    } catch (error) {
      console.error("Error fetching products:", error)
      return []
    }
  }

  // Get related products
  async getRelatedProducts(categoryID: string, params?: Omit<GoodsQueryParams, "categoryID">): Promise<Goods[]> {
    return this.getGoodsList({ ...params, categoryID })
  }

  // Search products
  async searchProducts(keyword: string, params?: Omit<GoodsQueryParams, "keyword">): Promise<Goods[]> {
    return this.getGoodsList({ ...params, keyword })
  }
}

// Create and export a singleton instance
export const goodsService = new GoodsService()

export default goodsService

