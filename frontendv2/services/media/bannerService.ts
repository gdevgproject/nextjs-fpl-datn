import apiClient, { DEFAULT_OPTION_SELLER } from "../api/apiClient"
import type { CommonQueryParams } from "../types/common"

export interface Banner {
  _id: string
  title: string
  description?: string
  image?: string
  imageID?: string
  link?: string
  type: number // 1-5: Static banners, 6: Slide, 7: Features, 8-11: Footer columns
  order?: number
  status: number
  createdAt: string
  updatedAt: string
}

export interface BannerQueryParams extends CommonQueryParams {
  type?: number
  status?: number
}

class BannerService {
  // Get banners by type
  async getBanners(params?: BannerQueryParams): Promise<Banner[]> {
    try {
      const queryParams = {
        optionSeller: DEFAULT_OPTION_SELLER,
        ...params,
      }

      const response = await apiClient.get<Banner[]>("/api/medias/banner", queryParams)
      return response
    } catch (error) {
      console.error("Error fetching banners:", error)
      return []
    }
  }

  // Get slides
  async getSlides(): Promise<Banner[]> {
    return this.getBanners({ type: 6 })
  }

  // Get features
  async getFeatures(): Promise<Banner[]> {
    return this.getBanners({ type: 7 })
  }

  // Get footer columns
  async getFooterColumns(): Promise<{ [key: string]: Banner[] }> {
    try {
      const columns: { [key: string]: Banner[] } = {}

      // Fetch all footer columns (types 8-11)
      for (let i = 8; i <= 11; i++) {
        const banners = await this.getBanners({ type: i })
        columns[`column${i - 7}`] = banners
      }

      return columns
    } catch (error) {
      console.error("Error fetching footer columns:", error)
      return {}
    }
  }
}

// Create and export a singleton instance
export const bannerService = new BannerService()

export default bannerService

