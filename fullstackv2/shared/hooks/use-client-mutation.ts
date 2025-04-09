import { createClient } from "@/shared/supabase/client";
import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
  QueryClient,
} from "@tanstack/react-query";
import { GenericSchema } from "@supabase/supabase-js/dist/module/lib/types";

const supabase = createClient();

/** Type definition for mutation actions */
type MutationAction = "insert" | "update" | "delete" | "upsert";

/**
 * Options for configuring the mutation.
 * @template Schema The database schema type.
 * @template TableName The name of the table being mutated.
 * @template TData The type of data returned by the mutation function.
 * @template TError The type of error thrown by the mutation function.
 * @template TVariables The type of variables passed to the mutation function.
 * @template TContext The type of context returned by `onMutate` and passed to `onError` and `onSettled`.
 */
type MutationOptions<
  Schema extends GenericSchema,
  TableName extends keyof Schema["Tables"],
  TData,
  TError,
  TVariables,
  TContext
> = {
  /**
   * Optional custom function for optimistic updates.
   * If provided, it overrides the default optimistic update behavior.
   * It receives the query key, the new variables, and the query client instance.
   */
  onOptimisticUpdate?: (
    queryKey: unknown[],
    newData: TVariables,
    queryClient: QueryClient
  ) => TContext | void;
  /** Array of query keys to invalidate upon successful mutation. */
  invalidateQueries?: unknown[][];
  /** Additional options for the underlying `useMutation` hook. */
  mutationOptions?: Omit<
    UseMutationOptions<TData, TError, TVariables, TContext>,
    "mutationFn" | "onMutate" | "onError" | "onSuccess"
  >;
};

/**
 * Base hook for performing mutations (insert, update, delete, upsert) on a Supabase table
 * on the client-side using TanStack Query. Handles optimistic updates and query invalidation.
 *
 * @template Schema The database schema type (e.g., Database).
 * @template TableName The name of the table to mutate (e.g., 'products').
 * @template TData The expected type of the data returned by the Supabase client on success.
 * @template TError The type of error expected (defaults to Error).
 * @template TVariables The type of the payload/variables required for the mutation (e.g., data for insert/update, id for delete).
 * @template TContext The context type for optimistic updates (defaults to unknown).
 *
 * @param table The name of the Supabase table to mutate.
 * @param action The type of mutation ('insert', 'update', 'delete', 'upsert').
 * @param primaryKey The name of the primary key column(s) for the table (defaults to 'id'). Needed for default optimistic updates.
 * @param options Configuration options for the mutation (optimistic updates, invalidation, etc.).
 *
 * @returns The result object from `useMutation`. Call `.mutate(variables)` or `.mutateAsync(variables)` to trigger the mutation.
 */
export function useClientMutate<
  Schema extends GenericSchema,
  TableName extends keyof Schema["Tables"] & string,
  TData = Schema["Tables"][TableName]["Row"][] | null, // Default based on Supabase client return
  TError = Error,
  TVariables =
    | Partial<Schema["Tables"][TableName]["Insert"]>
    | { id: any }
    | { ids: any[] }, // Adjust as needed
  TContext = { previousData?: TData } // Default context for optimistic updates
>(
  table: TableName,
  action: MutationAction,
  primaryKey: string | string[] = "id", // Allow composite keys
  options?: MutationOptions<
    Schema,
    TableName,
    TData,
    TError,
    TVariables,
    TContext
  >
) {
  const queryClient = useQueryClient();
  // Define a stable query key for the table, often used for invalidation or optimistic updates
  const tableQueryKey = [table];

  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn: async (payload: TVariables) => {
      let response: any;
      const pkArray = Array.isArray(primaryKey) ? primaryKey : [primaryKey];

      switch (action) {
        case "insert":
          response = await supabase
            .from(table)
            .insert(payload as any)
            .select(); // Often useful to select after insert
          break;
        case "update":
          // Ensure payload is an object
          if (typeof payload !== "object" || payload === null) {
            throw new Error("Update payload must be an object.");
          }
          // Build match condition dynamically for single or composite keys
          const matchConditionUpdate: { [key: string]: any } = {};
          let updateData: any = {};
          pkArray.forEach((key) => {
            if (!(key in payload))
              throw new Error(
                `Update payload must contain primary key field: '${key}'`
              );
            matchConditionUpdate[key] = (payload as any)[key];
          });
          // Separate PKs from data to update
          updateData = Object.keys(payload)
            .filter((key) => !pkArray.includes(key))
            .reduce((obj, key) => {
              obj[key] = (payload as any)[key];
              return obj;
            }, {} as any);

          if (Object.keys(updateData).length === 0) {
            console.warn(
              "Update payload contained only primary keys. No data fields to update."
            );
            // Decide how to handle this: throw error, return early, or proceed (might be valid if only checking existence)
            // For now, let it proceed, Supabase might handle it gracefully or return an appropriate response.
          }

          response = await supabase
            .from(table)
            .update(updateData)
            .match(matchConditionUpdate)
            .select();
          break;
        case "delete":
          // Ensure payload is an object
          if (typeof payload !== "object" || payload === null) {
            throw new Error("Delete payload must be an object.");
          }
          // Handle single ID or array of IDs
          if ("ids" in payload && Array.isArray((payload as any).ids)) {
            if (pkArray.length > 1)
              throw new Error(
                "Batch delete with composite keys requires custom logic or RPC."
              );
            response = await supabase
              .from(table)
              .delete()
              .in(pkArray[0], (payload as any).ids);
          } else {
            // Build match condition dynamically for single or composite keys
            const matchConditionDelete: { [key: string]: any } = {};
            pkArray.forEach((key) => {
              if (!(key in payload))
                throw new Error(
                  `Delete payload must contain primary key field: '${key}'`
                );
              matchConditionDelete[key] = (payload as any)[key];
            });
            response = await supabase
              .from(table)
              .delete()
              .match(matchConditionDelete);
          }
          break;
        case "upsert":
          response = await supabase
            .from(table)
            .upsert(payload as any, {
              onConflict: pkArray.join(","), // Supabase expects comma-separated string for composite keys
            })
            .select(); // Often useful to select after upsert
          break;
        default:
          throw new Error(`Unsupported mutation action: ${action}`);
      }

      if (response.error) {
        console.error(`Supabase ${action} error:`, response.error);
        throw response.error;
      }
      return response.data as TData;
    },
    onMutate: async (newData: TVariables): Promise<TContext> => {
      // Use custom optimistic update function if provided
      if (options?.onOptimisticUpdate) {
        const context = options.onOptimisticUpdate(
          tableQueryKey,
          newData,
          queryClient
        );
        // Ensure a compatible context is returned, even if the custom function returns void
        return (context ?? {}) as TContext;
      }

      // --- Default Optimistic Update Logic ---
      await queryClient.cancelQueries({ queryKey: tableQueryKey });
      const previousData = queryClient.getQueryData<{
        data: any[];
        count?: number | null;
      }>(tableQueryKey);

      // Helper to compare primary keys
      const itemMatches = (item: any, vars: TVariables): boolean => {
        if (typeof vars !== "object" || vars === null) return false;
        return Array.isArray(primaryKey)
          ? primaryKey.every(
              (key) => key in vars && item[key] === (vars as any)[key]
            )
          : primaryKey in vars &&
              item[primaryKey] === (vars as any)[primaryKey];
      };

      queryClient.setQueryData<{ data: any[]; count?: number | null }>(
        tableQueryKey,
        (old) => {
          if (!old || !Array.isArray(old.data)) return { data: [], count: 0 }; // Handle undefined/null/non-array initial data

          let updatedData = [...old.data];
          let updatedCount = old.count ?? old.data.length; // Fallback count

          switch (action) {
            case "insert":
              // Assume newData is the object being inserted
              // Use a temporary ID for optimistic UI rendering if PK is generated server-side
              const tempId = `optimistic-${Date.now()}`;
              const pkName = Array.isArray(primaryKey)
                ? primaryKey[0]
                : primaryKey; // Use first PK for temp ID
              updatedData.push({ [pkName]: tempId, ...(newData as object) });
              updatedCount++;
              break;
            case "update":
              updatedData = updatedData.map((item) =>
                itemMatches(item, newData)
                  ? { ...item, ...(newData as object) }
                  : item
              );
              // Count doesn't change on update
              break;
            case "delete":
              if (
                "ids" in (newData as any) &&
                Array.isArray((newData as any).ids)
              ) {
                // Batch delete optimistic update
                const idsToDelete = new Set((newData as any).ids);
                const pkName = Array.isArray(primaryKey)
                  ? primaryKey[0]
                  : primaryKey; // Assumes single PK for batch
                updatedData = updatedData.filter(
                  (item) => !idsToDelete.has(item[pkName])
                );
                updatedCount -= idsToDelete.size; // Adjust count
              } else {
                // Single delete optimistic update
                updatedData = updatedData.filter(
                  (item) => !itemMatches(item, newData)
                );
                updatedCount--; // Adjust count
              }
              break;
            case "upsert":
              // More complex: could be insert or update
              const existingIndex = updatedData.findIndex((item) =>
                itemMatches(item, newData)
              );
              if (existingIndex > -1) {
                // Update existing
                updatedData[existingIndex] = {
                  ...updatedData[existingIndex],
                  ...(newData as object),
                };
              } else {
                // Insert new (potentially with temp ID if needed)
                const tempIdUpsert = `optimistic-${Date.now()}`;
                const pkNameUpsert = Array.isArray(primaryKey)
                  ? primaryKey[0]
                  : primaryKey;
                const newItem = {
                  [pkNameUpsert]: tempIdUpsert,
                  ...(newData as object),
                };
                // Check if the actual PK was provided in newData, if so, use it
                if (Array.isArray(primaryKey)) {
                  primaryKey.forEach((key) => {
                    if (key in (newData as any))
                      newItem[key] = (newData as any)[key];
                  });
                } else {
                  if (primaryKey in (newData as any))
                    newItem[primaryKey] = (newData as any)[primaryKey];
                }
                updatedData.push(newItem);
                updatedCount++;
              }
              break;
          }

          // Ensure count doesn't go below zero
          updatedCount = Math.max(0, updatedCount);

          return { data: updatedData, count: updatedCount };
        }
      );

      // Return context with previous data for potential rollback
      return { previousData: previousData as any } as TContext;
    },
    onError: (error: TError, variables: TVariables, context?: TContext) => {
      console.error(`Mutation error (${action} on ${table}):`, error);
      // Rollback optimistic update if context contains previous data
      if ((context as any)?.previousData) {
        queryClient.setQueryData(tableQueryKey, (context as any).previousData);
      }
      // Optionally call a custom error handler from mutationOptions
      options?.mutationOptions?.onError?.(error, variables, context);
    },
    onSuccess: (data: TData, variables: TVariables, context?: TContext) => {
      // Invalidate specified queries or default table query
      const queriesToInvalidate = options?.invalidateQueries ?? [tableQueryKey];
      queriesToInvalidate.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      // Optionally call a custom success handler
      options?.mutationOptions?.onSuccess?.(data, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      // This runs after mutation completes (success or error)
      // Useful for cleanup or final invalidations regardless of outcome
      options?.mutationOptions?.onSettled?.(data, error, variables, context);
    },
    // Spread any remaining useMutation options
    ...options?.mutationOptions,
  });
}
