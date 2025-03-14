import apiClient, { DEFAULT_OPTION_SELLER } from "../api/apiClient"
import type { CommonQueryParams } from "../types/common"

export interface HabitTrack {
  _id: string
  habitID: string
  name: string
  duration: number
  date: string
  status: number
  createdAt: string
  updatedAt: string
}

export interface CreateHabitTrackData {
  optionSeller: number
  habitID: string
  name: string
  duration: number
  date: string
  status: number
}

export interface HabitTrackQueryParams extends CommonQueryParams {
  habitID?: string
  status?: number
  startDate?: string
  endDate?: string
}

class HabitTrackService {
  // Create a new habit track
  async createHabitTrack(data: CreateHabitTrackData): Promise<HabitTrack> {
    try {
      const payload = {
        ...data,
        optionSeller: data.optionSeller || DEFAULT_OPTION_SELLER,
      }

      const response = await apiClient.post<HabitTrack>("/api/crm/habit_track", payload)
      return response
    } catch (error) {
      console.error("Error creating habit track:", error)
      throw error
    }
  }

  // Update habit track
  async updateHabitTrack(
    trackID: string,
    data: Partial<Omit<CreateHabitTrackData, "optionSeller" | "habitID">>,
  ): Promise<HabitTrack> {
    try {
      const response = await apiClient.put<HabitTrack>(`/api/crm/habit_track/${trackID}`, data)
      return response
    } catch (error) {
      console.error("Error updating habit track:", error)
      throw error
    }
  }

  // Get habit tracks
  async getHabitTracks(params?: HabitTrackQueryParams): Promise<HabitTrack[]> {
    try {
      const queryParams = {
        optionSeller: DEFAULT_OPTION_SELLER,
        ...params,
      }

      const response = await apiClient.get<HabitTrack[]>("/api/crm/habit_track", queryParams)
      return response
    } catch (error) {
      console.error("Error fetching habit tracks:", error)
      return []
    }
  }
}

// Create and export a singleton instance
export const habitTrackService = new HabitTrackService()

export default habitTrackService

