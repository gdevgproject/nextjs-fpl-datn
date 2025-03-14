import apiClient, { DEFAULT_OPTION_SELLER } from "../api/apiClient"
import type { CommonQueryParams } from "../types/common"

export interface Survey {
  _id: string
  title: string
  description?: string
  questions: SurveyQuestion[]
  status: number
  createdAt: string
  updatedAt: string
}

export interface SurveyQuestion {
  _id: string
  title: string
  type: string // 'text', 'radio', 'checkbox', etc.
  options?: string[]
  required: boolean
}

export interface CreateSurveyData {
  title: string
  description?: string
  questions: Omit<SurveyQuestion, "_id">[]
  status?: number
}

export interface SurveyQueryParams extends CommonQueryParams {
  status?: number
}

class SurveyService {
  // Create a new survey
  async createSurvey(data: CreateSurveyData): Promise<Survey> {
    try {
      const response = await apiClient.post<Survey>("/api/crm/survey", data)
      return response
    } catch (error) {
      console.error("Error creating survey:", error)
      throw error
    }
  }

  // Get survey by ID
  async getSurveyById(surveyID: string): Promise<Survey> {
    try {
      const response = await apiClient.get<Survey>(`/api/crm/survey/${surveyID}`)
      return response
    } catch (error) {
      console.error("Error fetching survey:", error)
      throw error
    }
  }

  // Update survey
  async updateSurvey(surveyID: string, data: Partial<CreateSurveyData>): Promise<Survey> {
    try {
      const response = await apiClient.put<Survey>(`/api/crm/survey/${surveyID}`, data)
      return response
    } catch (error) {
      console.error("Error updating survey:", error)
      throw error
    }
  }

  // Get surveys list
  async getSurveys(params?: SurveyQueryParams): Promise<Survey[]> {
    try {
      const queryParams = {
        optionSeller: DEFAULT_OPTION_SELLER,
        ...params,
      }

      const response = await apiClient.get<Survey[]>("/api/crm/survey", queryParams)
      return response
    } catch (error) {
      console.error("Error fetching surveys:", error)
      return []
    }
  }
}

// Create and export a singleton instance
export const surveyService = new SurveyService()

export default surveyService

