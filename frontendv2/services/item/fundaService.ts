import apiClient, { DEFAULT_OPTION_SELLER } from "../api/apiClient"
import type { CommonQueryParams } from "../types/common"

export interface Funda {
  _id: string
  name: string
  description?: string
  address: string
  phone: string
  email?: string
  website?: string
  openingHours?: string
  image?: string
  rating?: number
  reviewCount?: number
  location?: {
    lat: number
    lng: number
  }
  status: number
  createdAt: string
  updatedAt: string
}

export interface FundaQueryParams extends CommonQueryParams {
  status?: number
}

class FundaService {
  // Get funda by ID
  async getFundaById(fundaID: string): Promise<Funda> {
    try {
      const response = await apiClient.get<Funda>(`/api/item/fundas/${fundaID}`)
      return response
    } catch (error) {
      console.error("Error fetching funda:", error)
      throw error
    }
  }

  // Get fundas list
  async getFundas(params?: FundaQueryParams): Promise<Funda[]> {
    try {
      const queryParams = {
        optionSeller: DEFAULT_OPTION_SELLER,
        ...params,
      }

      const response = await apiClient.get<Funda[]>("/api/item/fundas", queryParams)
      return response
    } catch (error) {
      console.error("Error fetching fundas:", error)
      return []
    }
  }

  // Get trusted shops
  async getTrustedShops(limit = 3): Promise<Funda[]> {
    return this.getFundas({ limit })
  }
}

// Create and export a singleton instance
export const fundaService = new FundaService()

export default fundaService

