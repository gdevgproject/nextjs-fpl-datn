import { createClient } from "@/shared/supabase/client"
import type { Database } from "@/shared/types"
import type { TableName, TableRow, TableInsert, TableUpdate } from "@/shared/types/hooks"
import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query"
import { type SupabaseClient, PostgrestError } from "@supabase/supabase-js"
import type { FetchHookResult } from "./use-client-fetch"

const supabase: SupabaseClient<Database> = createClient()

/** Type definition for mutation actions */
type MutationAction = "insert" | "update" | "delete" | "upsert"

/** Base type for payload identification (e.g., using primary key) */
type MatchPayload<T extends TableName> = Partial<TableRow<T>>

/**
 * Type for mutation variables, with stronger typing based on action.
 */
type MutationVariables<T extends TableName, TAction extends MutationAction> = TAction extends "insert"
  ? TableInsert<T> | TableInsert<T>[]
  : TAction extends "update"
    ? MatchPayload<T> & TableUpdate<T>
    : TAction extends "delete"
      ? MatchPayload<T>
      : TAction extends "upsert"
        ? TableInsert<T> | TableInsert<T>[]
        : never

/** Context for optimistic updates */
type MutationContext<T extends TableName> = {
  previousData?: FetchHookResult<TableRow<T>>
  optimisticUpdateApplied?: boolean
}

/**
 * Options for the mutation hook with corrected mutationOptions type
 */
type MutationHookOptions<
  T extends TableName,
  TAction extends MutationAction,
  TData = TableRow<T>[] | null,
  TError = PostgrestError,
> = {
  /** Array of query keys to invalidate upon successful mutation. */
  invalidateQueries?: QueryKey[]
  /**
   * The primary key column name(s). Crucial for 'update' and 'delete' operations,
   * and for optimistic updates.
   */
  primaryKey: keyof TableRow<T> | Array<keyof TableRow<T>>
  /**
   * Optional custom function for optimistic updates.
   * If provided, it overrides the default optimistic update behavior.
   */
  onOptimisticUpdate?: (
    variables: MutationVariables<T, TAction>,
    queryClient: QueryClient,
    queryKey: QueryKey,
  ) => MutationContext<T> | void | Promise<MutationContext<T> | void>
  /** Additional options for the underlying `useMutation` hook. */
  mutationOptions?: UseMutationOptions<TData, TError, MutationVariables<T, TAction>, MutationContext<T>>
}

/**
 * Base hook for performing mutations (insert, update, delete, upsert) on a Supabase table
 * on the client-side using TanStack Query. Strongly typed.
 */
export function useClientMutate<
  T extends TableName,
  TAction extends MutationAction,
  TData = TableRow<T>[] | null,
  TError = PostgrestError,
>(table: T, action: TAction, options: MutationHookOptions<T, TAction, TData, TError>) {
  const queryClient = useQueryClient()
  const { primaryKey, invalidateQueries, onOptimisticUpdate, mutationOptions } = options
  // Define a stable query key pattern for the table list
  const tableListQueryKey: QueryKey = [table, "list"]

  // Helper to extract primary key values and data fields for update
  const processUpdatePayload = (payload: object): { match: MatchPayload<T>; data: TableUpdate<T> } => {
    const match: Record<string, unknown> = {}
    const data: Record<string, unknown> = {}
    const pkArray = Array.isArray(primaryKey) ? primaryKey : [primaryKey]

    pkArray.forEach((key) => {
      if (!(key in payload)) throw new Error(`Update payload must contain primary key field: '${String(key)}'`)
      match[String(key)] = payload[key as keyof typeof payload]
    })

    Object.entries(payload).forEach(([key, value]) => {
      if (!pkArray.includes(key as keyof TableRow<T>)) {
        data[key] = value
      }
    })

    if (Object.keys(data).length === 0) {
      console.warn(`Update payload for table '${table}' contained only primary key(s). No data fields to update.`)
    }

    return {
      match: match as MatchPayload<T>,
      data: data as TableUpdate<T>,
    }
  }

  // Helper to create match object for delete
  const createMatchObject = (payload: object): MatchPayload<T> => {
    const match: Record<string, unknown> = {}
    const pkArray = Array.isArray(primaryKey) ? primaryKey : [primaryKey]

    pkArray.forEach((key) => {
      if (!(key in payload)) throw new Error(`Payload must contain primary key field: '${String(key)}'`)
      match[String(key)] = payload[key as keyof typeof payload]
    })

    return match as MatchPayload<T>
  }

  // Create a mutable copy of mutation options to use with our intercepted callbacks
  const finalMutationOptions: UseMutationOptions<TData, TError, MutationVariables<T, TAction>, MutationContext<T>> = {
    ...(mutationOptions || {}),
    // These will be properly merged later
  }

  return useMutation<TData, TError, MutationVariables<T, TAction>, MutationContext<T>>({
    mutationFn: async (payload): Promise<TData> => {
      let response: { data: unknown; error: PostgrestError | null }
      const pkArray = Array.isArray(primaryKey) ? primaryKey : [primaryKey]

      try {
        switch (action) {
          case "insert":
            // Type assertion needed because Supabase's polymorphic API accepts arrays or single items
            response = await supabase
              .from(table)
              .insert(payload as any) // Using 'any' to bypass the strict type checking
              .select()
            break
          case "update":
            const { match: matchUpdate, data: dataUpdate } = processUpdatePayload(payload as object)
            response = await supabase
              .from(table)
              .update(dataUpdate as any) // Using 'any' to bypass the strict type checking
              .match(matchUpdate)
              .select()
            break
          case "delete":
            const matchDelete = createMatchObject(payload as object)
            response = await supabase.from(table).delete().match(matchDelete)
            break
          case "upsert":
            const conflictConstraint = pkArray.map((key) => String(key)).join(",")
            response = await supabase
              .from(table)
              .upsert(payload as any, {
                // Using 'any' to bypass type checking
                onConflict: conflictConstraint,
              })
              .select()
            break
          default:
            throw new Error(`Unsupported mutation action: ${action}`)
        }

        if (response.error) {
          throw response.error
        }

        // Handle delete case where data is often null
        if (action === "delete") {
          return null as TData
        }

        return response.data as TData
      } catch (error) {
        console.error(`Supabase mutation error (${action} on ${table}):`, error)
        throw error instanceof PostgrestError ? error : new Error(String(error))
      }
    },
    onMutate: async (variables): Promise<MutationContext<T>> => {
      // Custom optimistic update takes precedence
      if (onOptimisticUpdate) {
        const context = await onOptimisticUpdate(variables, queryClient, tableListQueryKey)
        return { ...(context || {}), optimisticUpdateApplied: true }
      }

      // Default Optimistic Update Logic
      await queryClient.cancelQueries({ queryKey: tableListQueryKey })
      const previousData = queryClient.getQueryData<FetchHookResult<TableRow<T>>>(tableListQueryKey)

      // Helper to check if an item matches the variables based on PK
      const itemMatches = (item: TableRow<T>, vars: object): boolean => {
        if (typeof vars !== "object" || vars === null) return false
        const pkArray = Array.isArray(primaryKey) ? primaryKey : [primaryKey]
        return pkArray.every((key) => key in vars && item[key] === (vars as Record<string, unknown>)[key as string])
      }

      queryClient.setQueryData<FetchHookResult<TableRow<T>>>(tableListQueryKey, (old) => {
        if (!old || !Array.isArray(old.data)) return old

        let updatedData = [...(old.data as TableRow<T>[])]
        let updatedCount = old.count ?? old.data.length

        switch (action) {
          case "insert": {
            // Add new items
            const newItems = Array.isArray(variables) ? variables : [variables]
            updatedData = [...updatedData, ...(newItems as unknown as TableRow<T>[])]
            updatedCount += newItems.length
            break
          }
          case "update": {
            // Update matching items
            updatedData = updatedData.map((item) =>
              itemMatches(item, variables as object) ? { ...item, ...(variables as object) } : item,
            )
            break
          }
          case "delete": {
            // Remove matching items
            const initialLength = updatedData.length
            updatedData = updatedData.filter((item) => !itemMatches(item, variables as object))
            updatedCount -= initialLength - updatedData.length
            break
          }
          case "upsert": {
            // Find and update or insert items
            const itemsToUpsert = Array.isArray(variables) ? variables : [variables]

            itemsToUpsert.forEach((itemToUpsert) => {
              const existingIndex = updatedData.findIndex((item) => itemMatches(item, itemToUpsert as object))

              if (existingIndex > -1) {
                updatedData[existingIndex] = {
                  ...updatedData[existingIndex],
                  ...(itemToUpsert as object),
                }
              } else {
                updatedData.push(itemToUpsert as unknown as TableRow<T>)
                updatedCount++
              }
            })
            break
          }
        }

        // Ensure count is not negative
        updatedCount = Math.max(0, updatedCount)
        return { data: updatedData, count: updatedCount }
      })

      return { previousData, optimisticUpdateApplied: true }
    },
    onError: (error, variables, context) => {
      console.error(`Mutation error (${action} on ${table}):`, error)

      // Rollback optimistic update if applied and previous data exists
      if (context?.optimisticUpdateApplied && context?.previousData) {
        queryClient.setQueryData(tableListQueryKey, context.previousData)
        console.log(`Optimistic update rolled back for ${table}.`)
      } else if (context?.optimisticUpdateApplied) {
        console.warn(
          `Optimistic update applied for ${table}, but no previous data found for rollback. Invalidating query.`,
        )
        queryClient.invalidateQueries({ queryKey: tableListQueryKey })
      }

      // Call the original onError if provided
      if (mutationOptions?.onError) {
        mutationOptions.onError(error, variables, context)
      }
    },
    onSuccess: (data, variables, context) => {
      // Invalidate specified queries or default list query
      const queriesToInvalidate = invalidateQueries ?? [tableListQueryKey]
      console.log(`Mutation success (${action} on ${table}). Invalidating keys:`, queriesToInvalidate)

      queriesToInvalidate.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key })
      })

      // Call the original onSuccess if provided
      if (mutationOptions?.onSuccess) {
        mutationOptions.onSuccess(data, variables, context)
      }
    },
    onSettled: mutationOptions?.onSettled,
    ...finalMutationOptions,
  })
}
