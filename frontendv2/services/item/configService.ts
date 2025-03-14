import apiClient, { DEFAULT_OPTION_SELLER } from "../api/apiClient"

export interface Config {
  _id: string
  name: string
  value: any
  type: number
  status: number
  createdAt: string
  updatedAt: string
}

export interface ConfigQueryParams {
  optionSeller?: number
  isInfo?: number
  type?: number
}

class ConfigService {
  // Get contact information (hotline, social, etc.)
  async getContactInfo(): Promise<Config[]> {
    try {
      const params: ConfigQueryParams = {
        optionSeller: DEFAULT_OPTION_SELLER,
        isInfo: 1,
        type: 3,
      }

      const response = await apiClient.get<Config[]>("/api/item/configs", params)
      return response
    } catch (error) {
      console.error("Error fetching contact info:", error)
      return []
    }
  }

  // Get site configuration by type
  async getConfigByType(type: number): Promise<Config[]> {
    try {
      const params: ConfigQueryParams = {
        optionSeller: DEFAULT_OPTION_SELLER,
        type,
      }

      const response = await apiClient.get<Config[]>("/api/item/configs", params)
      return response
    } catch (error) {
      console.error("Error fetching config by type:", error)
      return []
    }
  }
}

// Create and export a singleton instance
export const configService = new ConfigService()

export default configService

