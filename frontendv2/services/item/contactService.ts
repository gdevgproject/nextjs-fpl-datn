import apiClient, { DEFAULT_OPTION_SELLER } from "../api/apiClient"
import type { CommonQueryParams } from "../types/common"

export interface Contact {
  _id: string
  name: string
  phone: string
  email?: string
  image?: string
  company?: string
  balance: number
  remainLoyaltyPoints: number
  status?: number
  createdAt?: string
  updatedAt?: string
}

export interface ContactQueryParams extends CommonQueryParams {
  contactID?: string
  phone?: string
  status?: number
}

class ContactService {
  // Get contact by ID
  async getContactById(contactID: string): Promise<Contact> {
    try {
      const response = await apiClient.get<Contact>(`/api/item/contacts/${contactID}`)
      return response
    } catch (error) {
      console.error("Error fetching contact:", error)
      throw error
    }
  }

  // Get contacts list
  async getContacts(params?: ContactQueryParams): Promise<Contact[]> {
    try {
      const queryParams = {
        optionSeller: DEFAULT_OPTION_SELLER,
        ...params,
      }

      const response = await apiClient.get<Contact[]>("/api/item/contacts", queryParams)
      return response
    } catch (error) {
      console.error("Error fetching contacts:", error)
      return []
    }
  }

  // Get coaches
  async getCoaches(limit = 3): Promise<Contact[]> {
    return this.getContacts({ limit })
  }

  // Get contact information
  async getContactInfo(customerID: string): Promise<Contact> {
    try {
      const response = await apiClient.get<Contact>(`/api/item/contacts?contactID=${customerID}`)
      return response
    } catch (error) {
      console.error("Error fetching contact info:", error)
      throw error
    }
  }
}

// Create and export a singleton instance
export const contactService = new ContactService()

export default contactService

