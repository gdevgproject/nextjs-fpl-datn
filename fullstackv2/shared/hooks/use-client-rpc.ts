// FILE: src/shared/hooks/use-client-rpc.ts
import { createClient } from "@/shared/supabase/client"
import type { Database } from "@/shared/types"
import type { FunctionName, FunctionArgs, FunctionReturns } from "@/shared/types/hooks"
import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query"
import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js"

// Explicitly type the client
const supabase: SupabaseClient<Database> = createClient()

/**
 * Base hook for calling Supabase RPC functions (PostgreSQL functions)
 * that primarily fetch data (like a GET request) using TanStack Query.
 *
 * @template TFunc The name of the RPC function from your Database schema.
 * @template TData The expected type of data returned by the RPC function.
 * @template TError The type of error expected (defaults to PostgrestError).
 * @template TParams The type of the parameters object passed to the RPC function.
 *
 * @param rpcName The name of the RPC function.
 * @param params Optional parameters object for the RPC function.
 * @param options Additional options for the underlying `useQuery` hook.
 *
 * @returns The result object from `useQuery`.
 */
export function useClientRpcQuery<
  TFunc extends FunctionName,
  // Infer parameter type from Database schema if available
  TParams extends FunctionArgs<TFunc> = FunctionArgs<TFunc>,
  // Infer return type from Database schema if available
  TData = FunctionReturns<TFunc>,
  TError = PostgrestError,
>(rpcName: TFunc, params?: TParams, options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">) {
  // Create a stable query key, including parameters if they exist
  const queryKey: QueryKey = params ? [rpcName, params] : [rpcName]

  return useQuery<TData, TError>({
    queryKey,
    queryFn: async () => {
      // Call the RPC function
      const { data, error } = await supabase.rpc(
        String(rpcName), // Convert to string to avoid implicit symbol-to-string conversion
        params as Record<string, unknown>,
      )

      if (error) {
        console.error(`Supabase RPC (${rpcName}) query error:`, error)
        throw error // Re-throw for TanStack Query
      }
      // Cast the returned data to the expected TData type
      return data as TData
    },
    ...options, // Spread the rest of the useQuery options
  })
}

/**
 * Base hook for calling Supabase RPC functions (PostgreSQL functions)
 * that perform mutations or actions (like a POST/PUT/DELETE request) using TanStack Query.
 *
 * @template TFunc The name of the RPC function from your Database schema.
 * @template TData The expected type of data returned by the RPC function on success.
 * @template TError The type of error expected (defaults to PostgrestError).
 * @template TParams The type of the parameters object passed to the RPC function.
 * @template TContext The context type for optimistic updates (if implemented).
 *
 * @param rpcName The name of the RPC function.
 * @param options Configuration options including query invalidation and standard `useMutation` options.
 *
 * @returns The result object from `useMutation`. Call `.mutate(params)` or `.mutateAsync(params)`.
 */
export function useClientRpcMutation<
  TFunc extends FunctionName,
  // Infer parameter type from Database schema if available
  TParams extends FunctionArgs<TFunc> = FunctionArgs<TFunc>,
  // Infer return type from Database schema if available
  TData = FunctionReturns<TFunc>,
  TError = PostgrestError,
  TContext = unknown,
>(
  rpcName: TFunc,
  options?: {
    /** Array of query keys to invalidate upon successful mutation. */
    invalidateQueries?: QueryKey[]
    /** Additional options for the underlying `useMutation` hook. */
    mutationOptions?: Omit<UseMutationOptions<TData, TError, TParams, TContext>, "mutationFn">
  },
) {
  const queryClient = useQueryClient()
  const { invalidateQueries = [], mutationOptions = {} } = options || {}

  return useMutation<TData, TError, TParams, TContext>({
    mutationFn: async (params: TParams) => {
      // Call the RPC function
      const { data, error } = await supabase.rpc(
        String(rpcName), // Convert to string to avoid implicit symbol-to-string conversion
        params as Record<string, unknown>,
      )

      if (error) {
        console.error(`Supabase RPC (${rpcName}) mutation error:`, error)
        throw error // Re-throw for TanStack Query
      }
      // Cast the returned data to the expected TData type
      return data as TData
    },
    onSuccess: (data, variables, context) => {
      // Invalidate specified queries upon success
      if (invalidateQueries.length > 0) {
        invalidateQueries.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key })
        })
      }
      // Call original onSuccess if provided
      if (mutationOptions.onSuccess) {
        mutationOptions.onSuccess(data, variables, context)
      }
    },
    // Spread the rest of the useMutation options
    ...mutationOptions,
  })
}
