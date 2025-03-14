import apiClient from "../api/apiClient"
import type { CommonQueryParams } from "../types/common"

export interface Voucher {
  _id: string
  name: string
  sign: string
  note?: string
  minOrderAmount: number
  salesoffAmount?: number
  salesoffRate?: number
  expired: string
  members?: string[]
  status: number
  createdAt: string
  updatedAt: string
}

export interface CreateVoucherData {
  name: string
  sign: string
  note?: string
  minOrderAmount: number
  salesoffAmount?: number
  salesoffRate?: number
  expired: string
  members?: string[]
  status?: number
}

export interface UpdateVoucherData extends Partial<CreateVoucherData> {
  membersAdd?: string[]
  membersRemove?: string[]
}

export interface VoucherQueryParams extends CommonQueryParams {
  customerID?: string
  status?: number
}

class VoucherService {
  // Create a new voucher
  async createVoucher(data: CreateVoucherData): Promise<Voucher> {
    try {
      const response = await apiClient.post<Voucher>("/api/store/vouchers", data)
      return response
    } catch (error) {
      console.error("Error creating voucher:", error)
      throw error
    }
  }

  // Get voucher by ID
  async getVoucherById(voucherID: string): Promise<Voucher> {
    try {
      const response = await apiClient.get<Voucher>(`/api/store/vouchers/${voucherID}`)
      return response
    } catch (error) {
      console.error("Error fetching voucher:", error)
      throw error
    }
  }

  // Update voucher
  async updateVoucher(voucherID: string, data: UpdateVoucherData): Promise<Voucher> {
    try {
      const response = await apiClient.put<Voucher>(`/api/store/vouchers/${voucherID}`, data)
      return response
    } catch (error) {
      console.error("Error updating voucher:", error)
      throw error
    }
  }

  // Get vouchers list
  async getVouchers(params?: VoucherQueryParams): Promise<Voucher[]> {
    try {
      const response = await apiClient.get<Voucher[]>("/api/store/vouchers", params)
      return response
    } catch (error) {
      console.error("Error fetching vouchers:", error)
      return []
    }
  }

  // Get customer vouchers
  async getCustomerVouchers(customerID: string, params?: Omit<VoucherQueryParams, "customerID">): Promise<Voucher[]> {
    return this.getVouchers({ ...params, customerID })
  }
}

// Create and export a singleton instance
export const voucherService = new VoucherService()

export default voucherService

