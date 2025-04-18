import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database.types";
import type {
  TableName,
  TableRow,
  FilterFunction,
  SearchConfig,
  SortConfig,
  PaginationConfig,
} from "@/shared/types/hooks";
import {
  useQuery,
  type UseQueryOptions,
  type QueryKey,
} from "@tanstack/react-query";
import type {
  PostgrestFilterBuilder,
  PostgrestTransformBuilder,
  PostgrestSingleResponse,
} from "@supabase/postgrest-js";
import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js";

// Explicitly type the client
const supabase: SupabaseClient<Database> = getSupabaseBrowserClient();

/**
 * Options for configuring the fetch query, now strongly typed.
 * @template T TableName - The name of the table being queried.
 * @template TResult The shape of the result (can include joined data). Defaults to the table's Row type.
 */
export type FetchHookOptions<
  T extends TableName,
  TResult = TableRow<T> // Default result is the row type
> = {
  /** Select specific columns, potentially with joins. E.g., `"id, name, profiles(*)"`, `"*"` */
  columns?: string;
  /**
   * Apply filters to the query. Provides type hints for the table's columns.
   * Example: `(query) => query.eq('status', 'active').gt('price', 100)`
   */
  filters?: FilterFunction<T, TResult>;
  /** Pagination settings. */
  pagination?: PaginationConfig;
  /** Sorting criteria. */
  sort?: SortConfig<TResult>[];
  /** Type of count to perform ('exact', 'planned', 'estimated'). 'exact' required for pagination total. */
  count?: "exact" | "planned" | "estimated";
  /** Full-text search or pattern matching configuration. */
  search?: SearchConfig<TResult>;
  /** Set to true to fetch a single record (e.g., using .eq('id', ...) and .single()). */
  single?: boolean;
};

/**
 * Type for the data returned by useClientFetch.
 * @template TData The shape of the data items.
 */
export type FetchHookResult<TData> = {
  data: TData | TData[] | null; // Can be single, array, or null
  count: number | null;
};

/**
 * Base hook for fetching data from a Supabase table on the client-side using TanStack Query.
 * Strongly typed based on your `Database` schema.
 */
export function useClientFetch<
  T extends TableName,
  TResult = TableRow<T> // Default result to the Row type of the table
>(
  key: QueryKey,
  table: T,
  options?: FetchHookOptions<T, TResult>,
  queryOptions?: Omit<
    UseQueryOptions<FetchHookResult<TResult>, PostgrestError>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<FetchHookResult<TResult>, PostgrestError>({
    queryKey: key,
    queryFn: async (): Promise<FetchHookResult<TResult>> => {
      const queryBuilder = supabase.from(table);

      // Base select query
      let selectQuery = queryBuilder.select(options?.columns || "*", {
        count: options?.count,
      }) as unknown as PostgrestTransformBuilder<
        Database["public"],
        TableRow<T>,
        TResult[]
      >;

      // Apply filters
      if (options?.filters) {
        // We need to cast selectQuery to FilterBuilder to apply filters
        const filterableQuery =
          selectQuery as unknown as PostgrestFilterBuilder<
            Database["public"],
            TableRow<T>,
            TResult
          >;
        selectQuery = options.filters(
          filterableQuery
        ) as unknown as PostgrestTransformBuilder<
          Database["public"],
          TableRow<T>,
          TResult[]
        >;
      }

      // Apply search - needs to be FilterBuilder
      if (options?.search && options.search.query) {
        const filterableQuery =
          selectQuery as unknown as PostgrestFilterBuilder<
            Database["public"],
            TableRow<T>,
            TResult
          >;
        const {
          column,
          query: searchQuery,
          type = "ilike",
          ftsOptions,
        } = options.search;

        // Fixed search functionality with specific type handling
        if (type === "fts") {
          const result = filterableQuery.textSearch(
            String(column),
            searchQuery,
            ftsOptions || {}
          );
          selectQuery = result as unknown as PostgrestTransformBuilder<
            Database["public"],
            TableRow<T>,
            TResult[]
          >;
        } else if (type === "ilike" || type === "like") {
          const result = filterableQuery[type](
            String(column),
            `%${searchQuery}%`
          );
          selectQuery = result as unknown as PostgrestTransformBuilder<
            Database["public"],
            TableRow<T>,
            TResult[]
          >;
        } else if (type === "eq") {
          const result = filterableQuery.eq(String(column), searchQuery);
          selectQuery = result as unknown as PostgrestTransformBuilder<
            Database["public"],
            TableRow<T>,
            TResult[]
          >;
        }
      }

      // Apply sorting - operates on TransformBuilder
      if (options?.sort && options.sort.length > 0) {
        options.sort.forEach((sort) => {
          selectQuery = selectQuery.order(String(sort.column), {
            ascending: sort.ascending ?? true,
            nullsFirst: sort.nullsFirst,
            foreignTable: sort.foreignTable,
          });
        });
      }

      // Apply pagination or single fetch - operates on TransformBuilder
      let response: PostgrestSingleResponse<TResult | TResult[]>;

      if (options?.single) {
        response = await selectQuery.single();
      } else if (options?.pagination) {
        const { page, pageSize } = options.pagination;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        response = await selectQuery.range(from, to);
      } else {
        // Fetch all (or limited by RLS/PostgREST config)
        response = await selectQuery;
      }

      // Handle the response
      const { data, error, count } = response;

      if (error && !(options?.single && error.code === "PGRST116")) {
        // Ignore 'single' error if no rows found
        console.error(`Supabase fetch error (${table}):`, error);
        throw error;
      }

      return {
        data: data as TResult | TResult[] | null,
        count,
      };
    },
    ...queryOptions,
  });
}
