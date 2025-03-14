import apiClient, { DEFAULT_OPTION_SELLER } from "../api/apiClient"
import type { CommonQueryParams } from "../types/common"

export interface Comment {
  _id: string
  goodsID: string
  content: string
  rating?: number
  parentID?: string
  children?: Comment[]
  author?: any // User who created the comment
  status: number
  createdAt: string
  updatedAt: string
}

export interface CreateCommentData {
  optionSeller: number
  goodsID: string
  content: string
  rating?: number
  parentID?: string
}

export interface CommentQueryParams extends CommonQueryParams {
  goodsID?: string
  parentID?: string
  status?: number
}

class CommentService {
  // Create a new comment
  async createComment(data: CreateCommentData): Promise<Comment> {
    try {
      const payload = {
        ...data,
        optionSeller: data.optionSeller || DEFAULT_OPTION_SELLER,
      }

      const response = await apiClient.post<Comment>("/api/medias/comments", payload)
      return response
    } catch (error) {
      console.error("Error creating comment:", error)
      throw error
    }
  }

  // Get comments for a product
  async getProductComments(goodsID: string, params?: Omit<CommentQueryParams, "goodsID">): Promise<Comment[]> {
    try {
      const queryParams = {
        optionSeller: DEFAULT_OPTION_SELLER,
        goodsID,
        ...params,
      }

      const response = await apiClient.get<Comment[]>("/api/medias/comments", queryParams)
      return response
    } catch (error) {
      console.error("Error fetching product comments:", error)
      return []
    }
  }

  // Get product reviews (comments with ratings)
  async getProductReviews(goodsID: string, params?: Omit<CommentQueryParams, "goodsID">): Promise<Comment[]> {
    try {
      const comments = await this.getProductComments(goodsID, params)
      return comments.filter((comment) => comment.rating !== undefined)
    } catch (error) {
      console.error("Error fetching product reviews:", error)
      return []
    }
  }

  // Get product Q&A (comments without ratings)
  async getProductQA(goodsID: string, params?: Omit<CommentQueryParams, "goodsID">): Promise<Comment[]> {
    try {
      const comments = await this.getProductComments(goodsID, params)
      return comments.filter((comment) => comment.rating === undefined)
    } catch (error) {
      console.error("Error fetching product Q&A:", error)
      return []
    }
  }
}

// Create and export a singleton instance
export const commentService = new CommentService()

export default commentService

