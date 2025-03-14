import type { BaseEntity } from "../../types/common"

export interface MediaFile extends BaseEntity {
  path: string
  nameOrg: string
  size?: number
  type?: string
  mimeType?: string
}

export interface MediaPost extends BaseEntity {
  title: string
  content: string
  summary?: string
  slug: string
  thumbnail?: string
  category?: string
  tags?: string[]
  status: number
  viewCount?: number
  thumbnailFile?: MediaFile
}

export interface MediaComment extends BaseEntity {
  content: string
  rating?: number
  parentId?: string
  mediaId: string
  status: number
  author?: string
}

export interface MediaTag extends BaseEntity {
  name: string
  slug: string
  description?: string
  status: number
}

export interface MediaMenu extends BaseEntity {
  name: string
  slug: string
  order?: number
  parentId?: string
  status: number
  childs?: MediaMenu[]
}

