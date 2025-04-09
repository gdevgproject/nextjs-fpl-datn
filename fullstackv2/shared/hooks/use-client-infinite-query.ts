import { createClient } from "@/shared/supabase/client";
import { Database } from "@/shared/types";
import { TableName, TableRow } from "@/shared/types/hooks";
import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  QueryKey,
} from "@tanstack/react-query";
import {
  PostgrestFilterBuilder,
  PostgrestTransformBuilder,
} from "@supabase/postgrest-js";
import { SupabaseClient, PostgrestError } from "@supabase/supabase-js";

// Explicitly type the client
const supabase: SupabaseClient<Database> = createClient();

/**
 * Options for configuring the infinite fetch query, strongly typed.
 * @template T TableName - The name of the table being queried.
 * @template TResult The shape of the result (can include joined data). Defaults to the table's Row type.
 */
export type InfiniteHookOptions<
  T extends TableName,
  TResult = TableRow<T> // Default result is the row type
> = {
  /** Select specific columns, potentially with joins. E.g., `"id, name, profiles(*)"`, `"*"` */
  columns?: string;
  /**
   * Apply filters to the query. Provides type hints for the table's columns.
   * Example: `(query) => query.eq('status', 'active').gt('price', 100)`
   */
  filters?: (
    query: PostgrestFilterBuilder<Database["public"], TableRow<T>, TResult>
  ) => PostgrestFilterBuilder<Database["public"], TableRow<T>, TResult>;
  /** The number of items to fetch per page. **Required**. */
  pageSize: number;
  /** Sorting criteria. */
  sort?: {
    column: keyof TResult | string; // Allow string for potentially joined/computed columns
    ascending?: boolean;
    nullsFirst?: boolean;
    foreignTable?: string; // Use for sorting joined columns
  }[];
  /** Full-text search or pattern matching configuration. */
  search?: {
    column: keyof TResult | string;
    query: string;
    type?: "ilike" | "like" | "eq" | "fts"; // Add more as needed
    ftsOptions?: {
      config?: string;
      type?: "plain" | "phrase" | "websearch";
    };
  };
};

/** Type for the data structure returned by the query function for each page */
interface InfiniteHookResult<TResult> {
  data: TResult[];
  nextPageParam: number | null; // Page number (0-based) as cursor
  totalCount: number | null;
}

/**
 * Base hook for fetching data from a Supabase table with infinite scrolling
 * on the client-side using TanStack Query. Strongly typed.
 */
export function useClientInfiniteQuery<
  T extends TableName,
  TResult = TableRow<T>
>(
  key: QueryKey, // Base query key
  table: T,
  options: InfiniteHookOptions<T, TResult>,
  queryOptions?: Omit<
    UseInfiniteQueryOptions<
      InfiniteHookResult<TResult>,
      PostgrestError,
      InfiniteHookResult<TResult>,
      InfiniteHookResult<TResult>,
      QueryKey,
      number
    >,
    "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam"
  >
) {
  const { pageSize } = options; // Extract pageSize for use

  return useInfiniteQuery<
    InfiniteHookResult<TResult>,
    PostgrestError,
    InfiniteHookResult<TResult>,
    QueryKey,
    number
  >({
    queryKey: key,
    queryFn: async ({ pageParam }): Promise<InfiniteHookResult<TResult>> => {
      // pageParam is number (page index, 0-based)
      const from = pageParam * pageSize;
      const to = from + pageSize - 1;

      const queryBuilder = supabase.from(table);

      // Base select query with type casting to handle Supabase generic type limitations
      let selectQuery = queryBuilder.select(options.columns || "*", {
        count: "exact", // Need exact count
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

        // Fix the search functionality type issues (similar to useClientFetch)
        let searchResult;
        if (type === "fts") {
          searchResult = filterableQuery.textSearch(
            String(column),
            searchQuery,
            ftsOptions || {}
          );
        } else if (type === "ilike" || type === "like") {
          searchResult = filterableQuery[type](
            String(column),
            `%${searchQuery}%`
          );
        } else if (type === "eq") {
          searchResult = filterableQuery.eq(String(column), searchQuery);
        }

        selectQuery = searchResult as unknown as PostgrestTransformBuilder<
          Database["public"],
          TableRow<T>,
          TResult[]
        >;
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

      // Apply range for the current page
      selectQuery = selectQuery.range(from, to);

      // Execute query
      const { data, error, count } = await selectQuery;

      if (error) {
        console.error(`Supabase infinite fetch error (${table}):`, error);
        throw error;
      }

      // Determine if there is a next page
      const hasMore = from + (data?.length || 0) < (count ?? 0);
      const nextPageParam = hasMore ? pageParam + 1 : null;

      return {
        data: data as TResult[],
        nextPageParam: nextPageParam,
        totalCount: count,
      };
    },
    initialPageParam: 0, // Start fetching from page 0
    getNextPageParam: (lastPage): number | null | undefined => {
      // Return the next page number or undefined/null if no more pages
      return lastPage.nextPageParam;
    },
    ...queryOptions,
  });
}
