import { createClient } from "@/supabase/client";
import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  QueryKey,
} from "@tanstack/react-query";
import { PostgrestFilterBuilder, PostgrestError } from "@supabase/postgrest-js";

const supabase = createClient();

/**
 * [V3 Base Hooks] Tùy chọn cho useClientInfiniteQuery.
 */
type InfiniteFetchDataOptions<
  Schema,
  Table extends keyof Schema["public"]["Tables"],
  Result
> = {
  /**
   * Chuỗi select theo chuẩn Supabase, bao gồm nested selects.
   * @example '*, brand(*), variants:product_variants(id, volume_ml)'
   * @default '*'
   */
  columns?: string;
  /**
   * Hàm nhận PostgrestFilterBuilder để áp dụng các bộ lọc (where, eq, gt, in, etc.).
   * @example query => query.eq('status', 'active').gt('price', 100)
   */
  filters?: (
    query: PostgrestFilterBuilder<
      Schema["public"]["Tables"][Table]["Row"],
      any,
      Result[]
    >
  ) => PostgrestFilterBuilder<
    Schema["public"]["Tables"][Table]["Row"],
    any,
    Result[]
  >;
  /**
   * Số lượng item mỗi trang. **Bắt buộc.**
   */
  pageSize: number;
  /**
   * Mảng các tùy chọn sắp xếp.
   */
  sort?: {
    column: keyof Schema["public"]["Tables"][Table]["Row"] | string; // Cho phép cả cột quan hệ 'relation.column'
    ascending?: boolean;
  }[];
  /**
   * Tùy chọn tìm kiếm văn bản cơ bản (sử dụng ILIKE). Ưu tiên fts nếu được cung cấp.
   */
  search?: {
    column: keyof Schema["public"]["Tables"][Table]["Row"] | string;
    query: string;
  };
  /**
   * Tùy chọn Full-Text Search (Postgres FTS). Sẽ ghi đè 'search' nếu được cung cấp.
   */
  fts?: {
    column: keyof Schema["public"]["Tables"][Table]["Row"] | string;
    query: string;
    config?: string; // Tùy chọn cấu hình FTS (vd: 'english')
  };
};

/**
 * [V3 Base Hooks] Kiểu dữ liệu trả về cho mỗi trang của infinite query.
 */
type InfiniteQueryResult<T> = {
  data: T[];
  nextPage: number | null; // Số trang tiếp theo (dùng làm pageParam)
  totalCount: number | null; // Tổng số bản ghi (nếu có)
};

/**
 * [V3 Base Hooks] Hook cơ sở để fetch dữ liệu dạng infinite scroll/load more.
 *
 * @template Schema - Kiểu schema Supabase.
 * @template Table - Tên bảng cần fetch.
 * @template Result - Kiểu dữ liệu mong đợi trả về cho mỗi item.
 * @param key Query key cho TanStack Query. Phải bao gồm các yếu tố filter/sort để key thay đổi khi filter/sort đổi.
 * @param table Tên bảng Supabase.
 * @param options Các tùy chọn fetch (columns, filters, pageSize, sort, search, fts).
 * @param queryOptions Các tùy chọn khác của useInfiniteQuery (TanStack Query).
 */
export function useClientInfiniteQuery<
  Schema extends { public: { Tables: any } },
  Table extends keyof Schema["public"]["Tables"],
  Result = Schema["public"]["Tables"][Table]["Row"]
>(
  key: QueryKey,
  table: Table,
  options: InfiniteFetchDataOptions<Schema, Table, Result>,
  queryOptions?: Omit<
    UseInfiniteQueryOptions<InfiniteQueryResult<Result>, PostgrestError>,
    "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam"
  >
) {
  const queryKey = Array.isArray(key) ? key : [key];

  return useInfiniteQuery<InfiniteQueryResult<Result>, PostgrestError>({
    queryKey: [...queryKey, options], // Bao gồm options trong key
    queryFn: async ({
      pageParam = 0,
    }): Promise<InfiniteQueryResult<Result>> => {
      const currentPage = typeof pageParam === "number" ? pageParam : 0;
      const from = currentPage * options.pageSize;
      const to = from + options.pageSize - 1;

      // Bắt đầu query
      let queryBuilder = supabase.from(table as string);

      // 1. Select columns (luôn yêu cầu count)
      let selectQuery = queryBuilder.select(options.columns || "*", {
        count: "exact", // Luôn cần count để tính trang tiếp theo
      });

      // 2. Áp dụng filters (nếu có)
      if (options.filters) {
        selectQuery = options.filters(selectQuery as any) as any;
      }

      // 3. Áp dụng FTS hoặc Search
      if (options.fts) {
        selectQuery = selectQuery.textSearch(
          options.fts.column as string,
          options.fts.query,
          { config: options.fts.config, type: "websearch" }
        );
      } else if (options.search) {
        selectQuery = selectQuery.ilike(
          options.search.column as string,
          `%${options.search.query}%`
        );
      }

      // 4. Áp dụng sắp xếp
      if (options.sort && options.sort.length > 0) {
        options.sort.forEach((sort) => {
          selectQuery = selectQuery.order(sort.column as string, {
            ascending: sort.ascending ?? true,
          });
        });
      }

      // 5. Áp dụng phân trang
      selectQuery = selectQuery.range(from, to);

      // Thực hiện truy vấn
      const { data, error, count } = await selectQuery;

      if (error) {
        console.error("Supabase infinite query error:", error);
        throw error;
      }

      // Tính toán trang tiếp theo
      const totalCount = count ?? 0;
      const nextPage =
        from + (data?.length ?? 0) < totalCount ? currentPage + 1 : null; // null nếu không còn trang nào

      return { data: (data ?? []) as Result[], nextPage, totalCount };
    },
    initialPageParam: 0, // Trang đầu tiên luôn là 0
    getNextPageParam: (lastPage) => lastPage.nextPage, // Lấy pageParam cho trang tiếp theo
    ...queryOptions,
  });
}
