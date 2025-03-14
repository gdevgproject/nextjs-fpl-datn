import axios from "axios"
import type {
  ArticleService,
  Article,
  ArticleCategory,
  ArticleListParams,
  ArticleListResponse,
} from "../types/articleTypes"

export class ArticleRealService implements ArticleService {
  async getArticles(params?: ArticleListParams): Promise<ArticleListResponse> {
    const response = await axios.get("/api/articles", { params })
    return response.data
  }

  async getArticleBySlug(slug: string): Promise<Article> {
    const response = await axios.get(`/api/articles/${slug}`)
    return response.data
  }

  async getArticleCategories(): Promise<ArticleCategory[]> {
    const response = await axios.get("/api/articles/categories")
    return response.data
  }

  async getRelatedArticles(articleSlug: string, limit?: number): Promise<Article[]> {
    const response = await axios.get(`/api/articles/${articleSlug}/related`, { params: { limit } })
    return response.data
  }

  async getFeaturedArticles(limit?: number): Promise<Article[]> {
    const response = await axios.get("/api/articles/featured", { params: { limit } })
    return response.data
  }

  async getPopularArticles(limit?: number): Promise<Article[]> {
    const response = await axios.get("/api/articles/popular", { params: { limit } })
    return response.data
  }
}

// Export a singleton instance
export const articleRealService = new ArticleRealService()

