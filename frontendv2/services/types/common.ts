// Common types used across services

export interface PaginationParams {
  page?: number
  limit?: number
  cursor?: string
}

export interface PaginatedResponse<T> {
  listRecords: T[]
  totalRecord: number
  totalPage: number
  limit: number
  nextCursor: string | null
}

export interface ApiResponse<T> {
  error: boolean
  data: T
  status?: number
  message?: string
}

export interface BaseEntity {
  _id: string
  createAt: string
  modifyAt: string
  state: number
  company: string
  userCreate: string
  userUpdate?: string
}

// Common error types
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public data?: any,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// Common query params
export interface CommonQueryParams {
  optionSeller?: number
  keyword?: string
  usage?: number
}

