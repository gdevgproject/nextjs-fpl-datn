import apiClient, { DEFAULT_OPTION_SELLER } from "../api/apiClient"
import type { CommonQueryParams } from "../types/common"

export interface SurveyResult {
  _id: string
  surveyID: string
  contactID?: string
  answers: SurveyAnswer[]
  createdAt: string
  updatedAt: string
}

export interface SurveyAnswer {
  questionID: string
  answer: string | string[] // Can be text or array of selected options
}

export interface CreateSurveyResultData {
  surveyID: string
  contactID?: string
  answers: SurveyAnswer[]
  phone?: string
  name?: string
}

export interface SurveyResultQueryParams extends CommonQueryParams {
  surveyID?: string
  contactID?: string
}

class SurveyResultService {
  // Submit survey result
  async submitSurveyResult(data: CreateSurveyResultData): Promise<SurveyResult> {
    try {
      const payload = {
        ...data,
        optionSeller: DEFAULT_OPTION_SELLER,
      }

      const response = await apiClient.post<SurveyResult>("/api/crm/survey_result", payload)
      return response
    } catch (error) {
      console.error("Error submitting survey result:", error)
      throw error
    }
  }

  // Get survey result by ID
  async getSurveyResultById(resultID: string): Promise<SurveyResult> {
    try {
      const response = await apiClient.get<SurveyResult>(`/api/crm/survey_result/${resultID}`)
      return response
    } catch (error) {
      console.error("Error fetching survey result:", error)
      throw error
    }
  }

  // Update survey result
  async updateSurveyResult(resultID: string, data: Partial<CreateSurveyResultData>): Promise<SurveyResult> {
    try {
      const response = await apiClient.put<SurveyResult>(`/api/crm/survey_result/${resultID}`, data)
      return response
    } catch (error) {
      console.error("Error updating survey result:", error)
      throw error
    }
  }

  // Get survey results
  async getSurveyResults(params?: SurveyResultQueryParams): Promise<SurveyResult[]> {
    try {
      const queryParams = {
        optionSeller: DEFAULT_OPTION_SELLER,
        ...params,
      }

      const response = await apiClient.get<SurveyResult[]>("/api/crm/survey_result", queryParams)
      return response
    } catch (error) {
      console.error("Error fetching survey results:", error)
      return []
    }
  }
}

// Create and export a singleton instance
export const surveyResultService = new SurveyResultService()

export default surveyResultService

