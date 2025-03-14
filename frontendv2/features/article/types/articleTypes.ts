// Types for article feature
export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  thumbnailUrl: string
  categories: ArticleCategory[]
  tags: string[]
  author: Author
  publishedAt: string
  updatedAt?: string
  readingTime: number
  viewCount: number
  featured: boolean
  size?: "small" | "medium" | "large" // For text size adjustment
  socialShares: number
  verified?: boolean
  source?: string
  relatedArticles?: string[] // IDs of related articles
}

export interface ArticleCategory {
  id: string
  name: string
  slug: string
  description?: string
  thumbnailUrl?: string
  parentId?: string // For nested categories
  order?: number
}

// Update the Author interface to include experience field
export interface Author {
  id: string
  name: string
  slug: string
  avatarUrl?: string
  bio?: string
  role?: string
  experience?: string
  verified?: boolean
  socialLinks?: {
    facebook?: string
    twitter?: string
    linkedin?: string
  }
}

export interface ArticleComment {
  id: string
  articleId: string
  author: {
    name: string
    email: string
    avatarUrl?: string
  }
  content: string
  createdAt: string
  replies?: ArticleComment[]
  likes: number
  verified?: boolean
}

// API Params & Responses
export interface ArticleListParams {
  categorySlug?: string
  search?: string
  page?: number
  limit?: number
  featured?: boolean
  sort?: "latest" | "popular" | "oldest"
  authorId?: string
  tag?: string
  verified?: boolean
}

export interface ArticleListResponse {
  articles: Article[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Service Interface
export interface ArticleService {
  getArticles(params?: ArticleListParams): Promise<ArticleListResponse>
  getArticleBySlug(slug: string): Promise<Article>
  getArticleCategories(): Promise<ArticleCategory[]>
  getRelatedArticles(articleSlug: string, limit?: number): Promise<Article[]>
  getFeaturedArticles(limit?: number): Promise<Article[]>
  getPopularArticles(limit?: number): Promise<Article[]>
  getArticleComments(articleId: string): Promise<ArticleComment[]>
  addArticleComment(articleId: string, comment: Omit<ArticleComment, "id" | "createdAt">): Promise<ArticleComment>
  likeArticle(articleId: string): Promise<void>
  shareArticle(articleId: string, platform: "facebook" | "twitter" | "linkedin"): Promise<void>
}

