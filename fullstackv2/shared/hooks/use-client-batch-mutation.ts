import { createClient } from "@/shared/supabase/client";
import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
  QueryClient,
  QueryKey,
} from "@tanstack/react-query";
import { GenericSchema } from "@supabase/supabase-js/dist/module/lib/types";
import { PostgrestError } from "@supabase/supabase-js";

const supabase = createClient();

/** Type definition for batch mutation actions */
type BatchMutationAction = "insert" | "update" | "delete" | "upsert";

/** Input variables for the batch mutation hook */
interface BatchMutationVariables<TItem = any> {
  /** The action to perform */
  action: BatchMutationAction;
  /** Array of items for the batch operation */
  items: TItem[];
  /** The column name(s) to match on for delete/upsert/update (defaults to 'id'). For composite keys, use an array. */
  matchColumn?: string | string[];
}

/** Options for configuring the batch mutation */
interface BatchMutationOptions<TData, TError, TVariables> {
  /**
   * Optional custom function for optimistic updates.
   * NOTE: Default optimistic updates are NOT provided for batch operations due to complexity.
   * Implement custom logic here if needed.
   */
  onOptimisticUpdate?: (
    queryKey: QueryKey,
    variables: TVariables,
    queryClient: QueryClient
  ) => void;
  /** Array of query keys to invalidate upon successful mutation. */
  invalidateQueries?: QueryKey[];
  /** Additional options for the underlying `useMutation` hook. */
  mutationOptions?: Omit<
    UseMutationOptions<TData, TError, TVariables>,
    "mutationFn" | "onMutate" | "onError" | "onSuccess"
  >;
}

/**
 * Base hook for performing batch mutations (insert, update, delete, upsert) on a Supabase table
 * on the client-side using TanStack Query.
 *
 * **Important Considerations:**
 * - **Batch Update:** Supabase JS v2 doesn't have a native batch `update`. This hook uses `upsert` as a workaround for the 'update' action, which might have slightly different behavior if items don't exist.
 * - **Optimistic Updates:** Default optimistic updates are NOT implemented due to the complexity of batch operations. Use the `onOptimisticUpdate` option for custom logic if required.
 * - **Error Handling:** If one item in the batch fails, Supabase might abort the entire batch or partially succeed depending on the operation and database constraints. Error messages might not pinpoint the exact failing item easily.
 *
 * @template Schema The database schema type (e.g., Database).
 * @template TableName The name of the table to mutate (e.g., 'products').
 * @template TData The expected type of the data returned by the Supabase client on success.
 * @template TError The type of error expected (defaults to PostgrestError).
 * @template TItem The type of a single item within the `items` array for the mutation.
 * @template TVariables The type of the variables object passed to the mutation function.
 *
 * @param table The name of the Supabase table to mutate.
 * @param options Configuration options for the mutation.
 *
 * @returns The result object from `useMutation`. Call `.mutate(variables)` or `.mutateAsync(variables)`.
 */
export function useClientBatchMutation<
  Schema extends GenericSchema,
  TableName extends keyof Schema["Tables"] & string,
  TData = Schema["Tables"][TableName]["Row"][] | null,
  TError = PostgrestError, // Use specific Supabase error type
  TItem = Partial<Schema["Tables"][TableName]["Insert"]> | { id: any }, // Type for one item in the batch
  TVariables = BatchMutationVariables<TItem>
>(table: TableName, options?: BatchMutationOptions<TData, TError, TVariables>) {
  const queryClient = useQueryClient();
  const tableQueryKey: QueryKey = [table]; // Base key for potential invalidation/optimistic updates

  return useMutation<TData, TError, TVariables>({
    mutationFn: async ({ action, items, matchColumn = "id" }: TVariables) => {
      // Ensure items is an array and not empty
      if (!Array.isArray(items) || items.length === 0) {
        console.warn(
          `useClientBatchMutation called with empty items array for action: ${action}`
        );
        return null as TData; // Or return { data: [] } based on expected TData
      }

      let response: any;
      const pkArray = Array.isArray(matchColumn) ? matchColumn : [matchColumn];
      const onConflictConstraint = pkArray.join(",");

      switch (action) {
        case "insert":
          response = await supabase
            .from(table)
            .insert(items as any)
            .select();
          break;
        case "update":
          // Workaround: Use upsert for batch update
          console.warn(
            `Executing batch 'update' for table '${table}' using 'upsert'. Ensure items contain necessary primary key(s) ('${onConflictConstraint}') and data fields.`
          );
          response = await supabase
            .from(table)
            .upsert(items as any, {
              onConflict: onConflictConstraint,
              ignoreDuplicates: false, // Ensure existing rows are updated
            })
            .select();
          break;
        case "delete":
          if (pkArray.length > 1) {
            // Batch delete with composite keys is tricky. Supabase `.in()` only works on one column.
            // Requires iterating or an RPC. Throwing error for clarity.
            throw new Error(
              `Batch delete with composite keys (${onConflictConstraint}) is not directly supported via this hook. Consider an RPC or iterative deletes.`
            );
          }
          // Extract values for the single primary key column
          const valuesToDelete = items.map((item) => {
            if (!(pkArray[0] in item))
              throw new Error(
                `Item missing primary key '${pkArray[0]}' for batch delete.`
              );
            return (item as any)[pkArray[0]];
          });
          response = await supabase
            .from(table)
            .delete()
            .in(pkArray[0], valuesToDelete); // Use .in for single column batch delete
          break;
        case "upsert":
          response = await supabase
            .from(table)
            .upsert(items as any, {
              onConflict: onConflictConstraint,
              ignoreDuplicates: false, // Default for upsert
            })
            .select();
          break;
        default:
          // Ensure exhaustive check at compile time if possible, otherwise runtime error
          const _exhaustiveCheck: never = action;
          throw new Error(`Unsupported batch mutation action: ${action}`);
      }

      if (response.error) {
        console.error(
          `Supabase batch ${action} error on table ${table}:`,
          response.error
        );
        throw response.error;
      }
      return response.data as TData;
    },
    onMutate: async (variables: TVariables) => {
      // Call custom optimistic update function if provided
      // Remember: No default optimistic logic is provided here.
      if (options?.onOptimisticUpdate) {
        await queryClient.cancelQueries({ queryKey: tableQueryKey }); // Cancel relevant queries before optimistic update
        options.onOptimisticUpdate(tableQueryKey, variables, queryClient);
      }
      // Default behavior returns undefined context
      return undefined;
    },
    onError: (error: TError, variables: TVariables, context) => {
      console.error(
        `Batch mutation error (${variables.action} on ${table}):`,
        error
      );
      // No default rollback as no default optimistic update. Rely on invalidation.
      options?.mutationOptions?.onError?.(error, variables, context);
    },
    onSuccess: (data: TData, variables: TVariables, context) => {
      // Invalidate specified queries or default table query
      const queriesToInvalidate = options?.invalidateQueries ?? [tableQueryKey];
      queriesToInvalidate.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      options?.mutationOptions?.onSuccess?.(data, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      options?.mutationOptions?.onSettled?.(data, error, variables, context);
    },
    // Spread any remaining useMutation options
    ...options?.mutationOptions,
  });
}
