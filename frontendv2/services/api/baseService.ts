import { ApiError, type ApiResponse } from "../types/common"
import apiClient from "./apiClient"

export abstract class BaseService {
  constructor(protected readonly basePath: string) {}

  protected async get<T>(path: string, params?: Record<string, any>, requireAuth = true): Promise<T> {
    try {
      const response = await apiClient.get<ApiResponse<T>>(`${this.basePath}${path}`, params, requireAuth)

      if (response.error) {
        throw new ApiError(response.status || 500, "API_ERROR", response.message || "Unknown error", response.data)
      }

      return response.data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, "UNKNOWN_ERROR", "An unknown error occurred", error)
    }
  }

  protected async post<T>(path: string, data?: Record<string, any>, requireAuth = true): Promise<T> {
    try {
      const response = await apiClient.post<ApiResponse<T>>(`${this.basePath}${path}`, data, requireAuth)

      if (response.error) {
        throw new ApiError(response.status || 500, "API_ERROR", response.message || "Unknown error", response.data)
      }

      return response.data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, "UNKNOWN_ERROR", "An unknown error occurred", error)
    }
  }

  protected async put<T>(path: string, data?: Record<string, any>, requireAuth = true): Promise<T> {
    try {
      const response = await apiClient.put<ApiResponse<T>>(`${this.basePath}${path}`, data, requireAuth)

      if (response.error) {
        throw new ApiError(response.status || 500, "API_ERROR", response.message || "Unknown error", response.data)
      }

      return response.data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, "UNKNOWN_ERROR", "An unknown error occurred", error)
    }
  }
}

