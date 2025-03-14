import apiClient from "../api/apiClient"
import type { CommonQueryParams } from "../types/common"

export interface MediaTag {
  _id: string
  name: string
  slug: string
  description?: string
  status: number
  createdAt: string
  updatedAt: string
}

export interface CreateMediaTagData {
  name: string
  slug?: string
  description?: string
  status?: number
}

export interface MediaTagQueryParams extends CommonQueryParams {
  status?: number
}

class MediaTagService {
  // Create a new media tag
  async createMediaTag(data: CreateMediaTagData): Promise<MediaTag> {
    try {
      const response = await apiClient.post<MediaTag>("/api/medias/tag", data)
      return response
    } catch (error) {
      console.error("Error creating media tag:", error)
      throw error
    }
  }

  // Get media tag by ID
  async getMediaTagById(tagID: string): Promise<MediaTag> {
    try {
      const response = await apiClient.get<MediaTag>(`/api/medias/tag/${tagID}`)
      return response
    } catch (error) {
      console.error("Error fetching media tag:", error)
      throw error
    }
  }

  // Update media tag
  async updateMediaTag(tagID: string, data: Partial<CreateMediaTagData>): Promise<MediaTag> {
    try {
      const response = await apiClient.put<MediaTag>(`/api/medias/tag/${tagID}`, data)
      return response
    } catch (error) {
      console.error("Error updating media tag:", error)
      throw error
    }
  }

  // Get media tags list
  async getMediaTags(params?: MediaTagQueryParams): Promise<MediaTag[]> {
    try {
      const response = await apiClient.get<MediaTag[]>("/api/medias/tag", params)
      return response
    } catch (error) {
      console.error("Error fetching media tags:", error)
      return []
    }
  }
}

// Create and export a singleton instance
export const mediaTagService = new MediaTagService()

export default mediaTagService

