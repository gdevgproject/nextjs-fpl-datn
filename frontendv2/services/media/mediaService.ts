import { BaseService } from "../api/baseService"
import type { PaginatedResponse, PaginationParams } from "../types/common"
import type { MediaPost, MediaComment, MediaTag, MediaMenu } from "./types/mediaTypes"

export class MediaService extends BaseService {
  constructor() {
    super("/api/medias")
  }

  // Posts
  async createPost(data: Partial<MediaPost>): Promise<MediaPost> {
    return this.post("", data)
  }

  async getPostById(id: string): Promise<MediaPost> {
    return this.get(`/${id}`)
  }

  async getPostBySlug(slug: string): Promise<MediaPost> {
    return this.get("", { slug })
  }

  async updatePost(id: string, data: Partial<MediaPost>): Promise<MediaPost> {
    return this.put(`/${id}`, data)
  }

  async getPosts(params?: PaginationParams): Promise<PaginatedResponse<MediaPost>> {
    return this.get("", params)
  }

  // Comments
  async createComment(data: Partial<MediaComment>): Promise<MediaComment> {
    return this.post("/comments", data)
  }

  async getComments(mediaId: string, params?: PaginationParams): Promise<PaginatedResponse<MediaComment>> {
    return this.get("/comments", { mediaId, ...params })
  }

  // Tags
  async getTags(params?: PaginationParams): Promise<PaginatedResponse<MediaTag>> {
    return this.get("/tag", params)
  }

  // Menu
  async getMenus(params?: { optionSeller?: number }): Promise<MediaMenu[]> {
    return this.get("/menu", params)
  }
}

export const mediaService = new MediaService()

