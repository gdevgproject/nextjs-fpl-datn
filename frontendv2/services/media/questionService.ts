import apiClient from "../api/apiClient"
import type { CommonQueryParams } from "../types/common"

export interface Question {
  _id: string
  question: string
  answer: string
  goodsID?: string
  status: number
  createdAt: string
  updatedAt: string
}

export interface CreateQuestionData {
  question: string
  answer: string
  goodsID?: string
  status?: number
}

export interface QuestionQueryParams extends CommonQueryParams {
  goodsID?: string
  status?: number
}

class QuestionService {
  // Create a new question
  async createQuestion(data: CreateQuestionData): Promise<Question> {
    try {
      const response = await apiClient.post<Question>("/api/medias/question", data)
      return response
    } catch (error) {
      console.error("Error creating question:", error)
      throw error
    }
  }

  // Get question by ID
  async getQuestionById(questionID: string): Promise<Question> {
    try {
      const response = await apiClient.get<Question>(`/api/medias/question/${questionID}`)
      return response
    } catch (error) {
      console.error("Error fetching question:", error)
      throw error
    }
  }

  // Update question
  async updateQuestion(questionID: string, data: Partial<CreateQuestionData>): Promise<Question> {
    try {
      const response = await apiClient.put<Question>(`/api/medias/question/${questionID}`, data)
      return response
    } catch (error) {
      console.error("Error updating question:", error)
      throw error
    }
  }

  // Get questions list
  async getQuestions(params?: QuestionQueryParams): Promise<Question[]> {
    try {
      const response = await apiClient.get<Question[]>("/api/medias/question", params)
      return response
    } catch (error) {
      console.error("Error fetching questions:", error)
      return []
    }
  }

  // Get questions for a product
  async getProductQuestions(goodsID: string, params?: Omit<QuestionQueryParams, "goodsID">): Promise<Question[]> {
    return this.getQuestions({ ...params, goodsID })
  }
}

// Create and export a singleton instance
export const questionService = new QuestionService()

export default questionService

