import { createClient } from "@/shared/supabase/client";
import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
  useQueryClient,
  QueryKey,
} from "@tanstack/react-query";
import { SupabaseClient } from "@supabase/supabase-js";

const supabase: SupabaseClient = createClient(); // Explicitly type if needed

/**
 * Base hook for calling Supabase RPC functions (PostgreSQL functions)
 * that primarily fetch data (like a GET request) using TanStack Query.
 *
 * @template TData The expected type of data returned by the RPC function.
 * @template TError The type of error expected (defaults to Error).
 * @template TParams The type of the parameters object passed to the RPC function.
 *
 * @param rpcName The name of the RPC function in your Supabase database.
 * @param params Optional parameters to pass to the RPC function. The query key will include these.
 * @param options Additional options for the underlying `useQuery` hook.
 *
 * @returns The result object from `useQuery`.
 */
export function useClientRpcQuery<
  TData = unknown,
  TError = Error,
  TParams = Record<string, unknown> | undefined // Use Record for object params, allow undefined
>(
  rpcName: string,
  params?: TParams,
  options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">
) {
  // Create a stable query key, including parameters if they exist
  const queryKey: QueryKey = params ? [rpcName, params] : [rpcName];

  return useQuery<TData, TError>({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase.rpc(rpcName, params); // Pass params directly

      if (error) {
        console.error(`Supabase RPC (${rpcName}) error:`, error);
        throw error; // Re-throw for TanStack Query
      }
      return data as TData;
    },
    ...options, // Spread the rest of the useQuery options
  });
}

/**
 * Base hook for calling Supabase RPC functions (PostgreSQL functions)
 * that perform mutations or actions (like a POST/PUT/DELETE request) using TanStack Query.
 *
 * @template TData The expected type of data returned by the RPC function on success.
 * @template TError The type of error expected (defaults to Error).
 * @template TParams The type of the parameters object passed to the RPC function.
 * @template TContext The context type for optimistic updates (if implemented).
 *
 * @param rpcName The name of the RPC function in your Supabase database.
 * @param options Configuration options including query invalidation and standard `useMutation` options.
 *
 * @returns The result object from `useMutation`. Call `.mutate(params)` or `.mutateAsync(params)`.
 */
export function useClientRpcMutation<
  TData = unknown,
  TError = Error,
  TParams = Record<string, unknown> | undefined, // Use Record for object params, allow undefined
  TContext = unknown
>(
  rpcName: string,
  options?: {
    /** Array of query keys to invalidate upon successful mutation. */
    invalidateQueries?: QueryKey[];
    /** Additional options for the underlying `useMutation` hook. */
    mutationOptions?: Omit<
      UseMutationOptions<TData, TError, TParams, TContext>,
      "mutationFn" | "onSuccess"
    >;
  }
) {
  const queryClient = useQueryClient();

  return useMutation<TData, TError, TParams, TContext>({
    mutationFn: async (params: TParams) => {
      const { data, error } = await supabase.rpc(rpcName, params); // Pass params directly

      if (error) {
        console.error(`Supabase RPC (${rpcName}) mutation error:`, error);
        throw error; // Re-throw for TanStack Query
      }
      return data as TData;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate specified queries upon success
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
      // Call original onSuccess if provided
      options?.mutationOptions?.onSuccess?.(data, variables, context);
    },
    // Spread the rest of the useMutation options (excluding mutationFn and onSuccess which we've handled)
    ...options?.mutationOptions,
  });
}
