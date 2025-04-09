// NOTE: This hook implements infinite scrolling. While the current requirement is standard pagination,
// this hook is kept available as it's well-implemented and might be needed in the future.
// For standard pagination, use `useClientFetch`.
import { createClient } from "@/shared/supabase/client";
import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  QueryKey,
} from "@tanstack/react-query";
import {
  PostgrestFilterBuilder,
  PostgrestTransformBuilder,
} from "@supabase/postgrest-js";
import { GenericSchema } from "@supabase/supabase-js/dist/module/lib/types";

const supabase = createClient();

/**
 * Options for configuring the infinite fetch query.
 * Similar to FetchOptions but requires pageSize and uses pageParam.
 * @template Schema The database schema type.
 * @template TableName The name of the table being queried.
 * @template Result The expected shape of a single row in the result.
 */
type InfiniteQueryOptions<
  Schema extends GenericSchema,
  TableName extends keyof Schema["Tables"],
  Result = Schema["Tables"][TableName]["Row"]
> = {
  /** Select specific columns, potentially with joins. E.g., `"id, name, profiles(*)"`, `"*"` */
  columns?: string;
  /**
   * Apply filters to the query.
   * Example: `(query) => query.eq('status', 'active').gt('price', 100)`
   */
  filters?: (
    query: PostgrestFilterBuilder<
      Schema,
      Schema["Tables"][TableName]["Row"],
      Result
    >
  ) => PostgrestFilterBuilder<
    Schema,
    Schema["Tables"][TableName]["Row"],
    Result
  >;
  /** The number of items to fetch per page. **Required** for infinite query. */
  pageSize: number;
  /** Sorting criteria. Applied in the order provided. */
  sort?: {
    column: keyof Result | string;
    ascending?: boolean;
    nullsFirst?: boolean;
    foreignTable?: string;
  }[];
  /** Full-text search or pattern matching configuration. */
  search?: {
    column: keyof Result | string;
    query: string;
    type?: "ilike" | "like" | "eq" | "fts";
    ftsOptions?: {
      config?: string;
      type?: "plain" | "phrase" | "websearch";
    };
  };
};

/** Type for the data structure returned by the query function for each page */
interface InfiniteQueryResult<T> {
  data: T[];
  nextPageParam: number | null; // Use page number as cursor
  totalCount: number | null; // Total count if available
}

/**
 * Base hook for fetching data from a Supabase table with infinite scrolling
 * on the client-side using TanStack Query.
 *
 * NOTE: Consider using `useClientFetch` with standard pagination if infinite scroll is not required.
 *
 * @template Schema The database schema type (e.g., Database).
 * @template TableName The name of the table to query (e.g., 'products').
 * @template Result The expected shape of the data array elements. Defaults to the table's Row type.
 *
 * @param key The base TanStack Query key. Page parameters are added automatically.
 * @param table The name of the Supabase table to query.
 * @param options Fetch configuration (columns, filters, pageSize, sort, search). `pageSize` is required.
 * @param queryOptions Additional options for `useInfiniteQuery`.
 *
 * @returns The result object from `useInfiniteQuery`. Access pages via `data.pages`. Use `fetchNextPage`, `hasNextPage`, etc.
 */
export function useClientInfiniteQuery<
  Schema extends GenericSchema,
  TableName extends keyof Schema["Tables"] & string,
  Result = Schema["Tables"][TableName]["Row"]
>(
  key: QueryKey, // Base query key
  table: TableName,
  options: InfiniteQueryOptions<Schema, TableName, Result>,
  queryOptions?: Omit<
    UseInfiniteQueryOptions<InfiniteQueryResult<Result>, Error>,
    "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam"
  >
) {
  const baseQueryKey = key; // Use the provided key directly

  return useInfiniteQuery<InfiniteQueryResult<Result>, Error>({
    queryKey: baseQueryKey, // TanStack Query manages page params internally based on this key
    queryFn: async ({ pageParam = 0 }) => {
      // pageParam is the page number (0-based index)
      const from = pageParam * options.pageSize;
      const to = from + options.pageSize - 1;

      let queryBuilder = supabase.from(table);
      let selectQuery: PostgrestTransformBuilder<
        Schema,
        Schema["Tables"][TableName]["Row"],
        Result[]
      > = queryBuilder.select(options.columns || "*", {
        count: "exact", // Need exact count to determine if there are more pages
      }) as PostgrestTransformBuilder<
        Schema,
        Schema["Tables"][TableName]["Row"],
        Result[]
      >;

      let filteredQuery: PostgrestFilterBuilder<
        Schema,
        Schema["Tables"][TableName]["Row"],
        Result
      > = options.filters
        ? options.filters(
            selectQuery as PostgrestFilterBuilder<
              Schema,
              Schema["Tables"][TableName]["Row"],
              Result
            >
          )
        : (selectQuery as PostgrestFilterBuilder<
            Schema,
            Schema["Tables"][TableName]["Row"],
            Result
          >);

      if (options.search && options.search.query) {
        const {
          column,
          query: searchQuery,
          type = "ilike",
          ftsOptions,
        } = options.search;
        if (type === "fts") {
          filteredQuery = filteredQuery.textSearch(
            column as string,
            `'${searchQuery}'`,
            ftsOptions || {}
          );
        } else {
          filteredQuery = filteredQuery[type](
            column as string,
            `%${searchQuery}%`
          );
        }
      }

      if (options.sort && options.sort.length > 0) {
        options.sort.forEach((sort) => {
          filteredQuery = filteredQuery.order(sort.column as string, {
            ascending: sort.ascending ?? true,
            nullsFirst: sort.nullsFirst,
            foreignTable: sort.foreignTable,
          });
        });
      }

      // Apply range for the current page
      filteredQuery = filteredQuery.range(from, to);

      const { data, error, count } = await filteredQuery;

      if (error) {
        console.error("Supabase infinite fetch error:", error);
        throw error;
      }

      // Determine if there is a next page
      const hasMore = from + (data?.length || 0) < (count ?? 0);
      const nextPageParam = hasMore ? pageParam + 1 : null;

      return {
        data: data as Result[],
        nextPageParam: nextPageParam,
        totalCount: count,
      };
    },
    initialPageParam: 0, // Start fetching from page 0
    getNextPageParam: (lastPage) => {
      // Return the next page number or undefined/null if there are no more pages
      return lastPage.nextPageParam;
    },
    ...queryOptions,
  });
}
