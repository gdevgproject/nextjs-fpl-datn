import { apiClient } from "@/services/api/apiClient"
import type { CheckoutFormData } from "../types/checkoutTypes"

export const checkoutService = {
  createOrder: async (data: CheckoutFormData) => {
    const response = await apiClient.post("/orders", data)
    return response.data
  },

  getProvinces: async () => {
    const response = await apiClient.get("/provinces")
    return response.data
  },

  getDistricts: async (provinceId: string) => {
    const response = await apiClient.get(`/districts?provinceId=${provinceId}`)
    return response.data
  },

  getWards: async (districtId: string) => {
    const response = await apiClient.get(`/wards?districtId=${districtId}`)
    return response.data
  },
}

