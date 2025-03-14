import apiClient, { DEFAULT_OPTION_SELLER } from "../api/apiClient"
import type { CommonQueryParams } from "../types/common"

export interface Combo {
  _id: string
  name: string
  description?: string
  products: any[] // Product details after population
  startDate: string
  endDate: string
  discount: number
  status: number
  createdAt: string
  updatedAt: string
}

export interface ComboQueryParams extends CommonQueryParams {
  status?: number
  limit?: number
}

class ComboService {
  // Get active hot deals
  async getActiveHotDeals(params?: Omit<ComboQueryParams, "status">): Promise<Combo[]> {
    try {
      const queryParams = {
        optionSeller: DEFAULT_OPTION_SELLER,
        limit: params?.limit || 1,
        populates: JSON.stringify({
          path: "products",
          select: "name sign unit sellingUnitprice listedUnitprice images",
          populate: {
            path: "images",
            select: "path nameOrg",
          },
        }),
      }

      const response = await apiClient.get<Combo[]>("/api/crm/combo", queryParams)
      return response
    } catch (error) {
      console.error("Error fetching hot deals:", error)
      return []
    }
  }

  // Get best sellers
  async getBestSellers(params?: ComboQueryParams): Promise<Combo[]> {
    try {
      const queryParams = {
        optionSeller: DEFAULT_OPTION_SELLER,
        ...params,
      }

      const response = await apiClient.get<Combo[]>("/api/crm/combo/best-seller", queryParams)
      return response
    } catch (error) {
      console.error("Error fetching best sellers:", error)
      return []
    }
  }
}

// Create and export a singleton instance
export const comboService = new ComboService()

export default comboService

