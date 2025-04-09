import type { Database } from "@/shared/types"
import type { PostgrestError, PostgrestFilterBuilder, PostgrestSingleResponse } from "@supabase/supabase-js"

// Define public schema reference for convenience
export type PublicSchema = Database["public"]

// Core table type helpers
export type Tables = PublicSchema["Tables"]
export type TableName = keyof Tables

// Row, insert, and update types for tables
export type TableRow<T extends TableName> = Tables[T]["Row"]
export type TableInsert<T extends TableName> = Tables[T]["Insert"]
export type TableUpdate<T extends TableName> = Tables[T]["Update"]

// Function related types
export type Functions = PublicSchema["Functions"]
export type FunctionName = keyof Functions
export type FunctionArgs<F extends FunctionName> = Functions[F]["Args"]
export type FunctionReturns<F extends FunctionName> = Functions[F]["Returns"]

// Storage bucket types
export type StorageBuckets = keyof Database["storage"]["buckets"]

// Common error type
export type ApiError = PostgrestError

// Filter function type for query hooks
export type FilterFunction<T extends TableName, TResult = TableRow<T>> = (
  query: PostgrestFilterBuilder<Database["public"], TableRow<T>, TResult>,
) => PostgrestFilterBuilder<Database["public"], TableRow<T>, TResult>

// Search configuration for query hooks
export type SearchConfig<TResult> = {
  column: keyof TResult | string
  query: string
  type?: "ilike" | "like" | "eq" | "fts"
  ftsOptions?: {
    config?: string
    websearch?: boolean
  }
}

// Sort configuration for query hooks
export type SortConfig<TResult> = {
  column: keyof TResult | string
  ascending?: boolean
  nullsFirst?: boolean
  foreignTable?: string
}

// Pagination configuration for query hooks
export type PaginationConfig = {
  page: number
  pageSize: number
}

// Response type for PostgrestSingleResponse with count
export type PostgrestResponseWithCount<T> = PostgrestSingleResponse<T> & {
  count: number | null
}

// Join types for complex queries
export type JoinConfig = {
  foreignTable: string
  columns?: string
  joinType?: "inner" | "left" | "right" | "full"
}

// Aggregate function types
export type AggregateFunction = "count" | "sum" | "avg" | "min" | "max"

// Aggregate configuration
export type AggregateConfig = {
  function: AggregateFunction
  column?: string
  alias?: string
}

// Group by configuration
export type GroupByConfig = {
  columns: string[]
}

// Transaction configuration
export type TransactionConfig<T extends TableName> = {
  operations: Array<{
    type: "insert" | "update" | "delete" | "upsert"
    table: T
    data: TableInsert<T> | TableUpdate<T> | Record<string, unknown>
    filters?: FilterFunction<T, TableRow<T>>
  }>
  options?: {
    autoCommit?: boolean
  }
}

// Subscription configuration
export type SubscriptionConfig<T extends TableName> = {
  event: "INSERT" | "UPDATE" | "DELETE" | "*"
  schema?: string
  table: T
  filter?: string
}

// Realtime channel configuration
export type RealtimeConfig = {
  event: "presence" | "postgres_changes" | "broadcast"
  schema?: string
  table?: string
  filter?: string
  channel?: string
}

// RPC call configuration
export type RpcConfig<F extends FunctionName> = {
  function: F
  params: FunctionArgs<F>
}

// Storage upload configuration
export type StorageUploadConfig = {
  bucket: StorageBuckets
  path: string
  file: File | Blob
  options?: {
    cacheControl?: string
    contentType?: string
    upsert?: boolean
  }
}

// Storage download configuration
export type StorageDownloadConfig = {
  bucket: StorageBuckets
  path: string
  options?: {
    transform?: {
      width?: number
      height?: number
      resize?: "cover" | "contain" | "fill"
      format?: "origin" | "webp" | "png" | "jpeg"
      quality?: number
    }
  }
}

// Storage list configuration
export type StorageListConfig = {
  bucket: StorageBuckets
  path?: string
  options?: {
    limit?: number
    offset?: number
    sortBy?: {
      column?: "name" | "updated_at" | "created_at" | "last_accessed_at" | "size"
      order?: "asc" | "desc"
    }
    search?: string
  }
}

// Storage remove configuration
export type StorageRemoveConfig = {
  bucket: StorageBuckets
  paths: string[]
}

// Auth configuration
export type AuthConfig = {
  provider?:
    | "email"
    | "phone"
    | "google"
    | "facebook"
    | "github"
    | "gitlab"
    | "twitter"
    | "apple"
    | "azure"
    | "bitbucket"
    | "discord"
    | "keycloak"
    | "linkedin"
    | "notion"
    | "slack"
    | "spotify"
    | "twitch"
    | "workos"
    | "zoom"
  options?: Record<string, unknown>
  redirectTo?: string
  scopes?: string
}

// Webhook configuration
export type WebhookConfig = {
  event: string
  url: string
  headers?: Record<string, string>
}

// Edge function configuration
export type EdgeFunctionConfig = {
  functionName: string
  options?: {
    headers?: Record<string, string>
    body?: Record<string, unknown>
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  }
}
