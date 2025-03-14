import { isMockApi } from "@/config/apiConfig"

// Generic type for API service factory
export type ApiServiceFactory<T> = {
  getService: () => T
}

// Factory function to create API services with automatic mock/real switching
export function createApiServiceFactory<T>(mockService: T, realService: T): ApiServiceFactory<T> {
  return {
    getService: () => {
      return isMockApi() ? mockService : realService
    },
  }
}

