import apiClient, { DEFAULT_OPTION_SELLER } from "../api/apiClient"
import type { CommonQueryParams } from "../types/common"

export interface Habit {
  _id: string
  contactID: string
  name: string
  challenge: string
  status?: number
  createdAt: string
  updatedAt: string
}

export interface CreateHabitData {
  optionSeller: number
  contactID: string
  name: string
  challenge: string
  status?: number
}

export interface HabitQueryParams extends CommonQueryParams {
  contactID?: string
  status?: number
}

class HabitService {
  // Create a new habit
  async createHabit(data: CreateHabitData): Promise<Habit> {
    try {
      const payload = {
        ...data,
        optionSeller: data.optionSeller || DEFAULT_OPTION_SELLER,
      }

      const response = await apiClient.post<Habit>("/api/crm/habit", payload)
      return response
    } catch (error) {
      console.error("Error creating habit:", error)
      throw error
    }
  }

  // Update habit
  async updateHabit(
    habitID: string,
    data: Partial<Omit<CreateHabitData, "optionSeller" | "contactID">>,
  ): Promise<Habit> {
    try {
      const response = await apiClient.put<Habit>(`/api/crm/habit/${habitID}`, data)
      return response
    } catch (error) {
      console.error("Error updating habit:", error)
      throw error
    }
  }

  // Get habits for a contact
  async getHabits(params?: HabitQueryParams): Promise<Habit[]> {
    try {
      const queryParams = {
        optionSeller: DEFAULT_OPTION_SELLER,
        ...params,
      }

      const response = await apiClient.get<Habit[]>("/api/crm/habit", queryParams)
      return response
    } catch (error) {
      console.error("Error fetching habits:", error)
      return []
    }
  }
}

// Create and export a singleton instance
export const habitService = new HabitService()

export default habitService

