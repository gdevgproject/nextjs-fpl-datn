import apiClient, { DEFAULT_OPTION_SELLER } from "../api/apiClient"
import type { CommonQueryParams } from "../types/common"

export interface MediaMenu {
  _id: string
  name: string
  slug?: string
  description?: string
  parent?: string
  childs?: MediaMenu[]
  status: number
  order?: number
  createdAt: string
  updatedAt: string
}

export interface CreateMediaMenuData {
  name: string
  slug?: string
  description?: string
  parent?: string
  status?: number
  order?: number
}

export interface MediaMenuQueryParams extends CommonQueryParams {
  status?: number
}

class MediaMenuService {
  // Create a new media menu
  async createMediaMenu(data: CreateMediaMenuData): Promise<MediaMenu> {
    try {
      const response = await apiClient.post<MediaMenu>("/api/medias/menu", data)
      return response
    } catch (error) {
      console.error("Error creating media menu:", error)
      throw error
    }
  }

  // Get media menu by ID
  async getMediaMenuById(menuID: string): Promise<MediaMenu> {
    try {
      const response = await apiClient.get<MediaMenu>(`/api/medias/menu/${menuID}`)
      return response
    } catch (error) {
      console.error("Error fetching media menu:", error)
      throw error
    }
  }

  // Update media menu
  async updateMediaMenu(menuID: string, data: Partial<CreateMediaMenuData>): Promise<MediaMenu> {
    try {
      const response = await apiClient.put<MediaMenu>(`/api/medias/menu/${menuID}`, data)
      return response
    } catch (error) {
      console.error("Error updating media menu:", error)
      throw error
    }
  }

  // Get media menus list
  async getMediaMenus(params?: MediaMenuQueryParams): Promise<MediaMenu[]> {
    try {
      const queryParams = {
        optionSeller: DEFAULT_OPTION_SELLER,
        populates: JSON.stringify({ path: "childs" }),
        ...params,
      }

      const response = await apiClient.get<MediaMenu[]>("/api/medias/menu", queryParams)
      return response
    } catch (error) {
      console.error("Error fetching media menus:", error)
      return []
    }
  }
}

// Create and export a singleton instance
export const mediaMenuService = new MediaMenuService()

export default mediaMenuService

