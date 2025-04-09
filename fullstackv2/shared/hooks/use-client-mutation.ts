import { createClient } from "@/shared/supabase/client";
import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
  QueryKey,
  QueryClient,
} from "@tanstack/react-query";
import { PostgrestError } from "@supabase/postgrest-js";

const supabase = createClient();

/**
 * [V3 Base Hooks] Các hành động mutation được hỗ trợ.
 * `softDelete`: Cập nhật cột 'deleted_at'.
 */
type MutationAction = "insert" | "update" | "delete" | "upsert" | "softDelete";

/**
 * [V3 Base Hooks] Dữ liệu context cho optimistic update.
 */
type OptimisticContext<TVariables> = {
  previousData?: unknown; // Dữ liệu cũ trước khi optimistic update
  variables?: TVariables; // Dữ liệu mới được dùng để mutate
};

/**
 * [V3 Base Hooks] Tùy chọn cho useClientMutate.
 */
type ClientMutationOptions<TData, TError, TVariables, TContext> = {
  /**
   * Hàm xử lý optimistic update tùy chỉnh.
   * Cung cấp queryClient để bạn có thể cập nhật nhiều query caches.
   */
  onOptimisticUpdate?: (
    variables: TVariables,
    context: TContext,
    queryClient: QueryClient
  ) => TContext | Promise<TContext>;
  /**
   * Mảng các queryKey cần được invalidate sau khi mutation thành công.
   * Nếu không cung cấp, sẽ invalidate mặc định theo [table].
   */
  invalidateQueries?: QueryKey[];
  /**
   * Các tùy chọn khác của useMutation (TanStack Query).
   */
  mutationOptions?: Omit<
    UseMutationOptions<TData, TError, TVariables, TContext>,
    "mutationFn" | "onMutate" | "onError" | "onSuccess"
  >;
};

/**
 * [V3 Base Hooks] Hook cơ sở để thực hiện các thao tác INSERT, UPDATE, DELETE, UPSERT, SOFT_DELETE trên một bảng Supabase.
 * Hỗ trợ optimistic updates (mặc định và tùy chỉnh), invalidate queries.
 *
 * @template TData - Kiểu dữ liệu trả về từ Supabase sau mutation (thường là mảng các bản ghi).
 * @template TError - Kiểu lỗi (mặc định là PostgrestError).
 * @template TVariables - Kiểu dữ liệu của payload gửi đi khi mutate.
 * @template TContext - Kiểu dữ liệu của context dùng trong optimistic updates.
 * @param table Tên bảng Supabase.
 * @param action Hành động mutation ('insert', 'update', 'delete', 'upsert', 'softDelete').
 * @param options Các tùy chọn (onOptimisticUpdate, invalidateQueries, mutationOptions).
 */
export function useClientMutate<
  TData = any,
  TError = PostgrestError,
  TVariables = any,
  TContext extends OptimisticContext<TVariables> = OptimisticContext<TVariables>
>(
  table: string,
  action: MutationAction,
  options?: ClientMutationOptions<TData, TError, TVariables, TContext>
) {
  const queryClient = useQueryClient();
  const primaryKey = "id"; // Giả định khóa chính là 'id', có thể làm tham số nếu cần

  return useMutation<TData, TError, TVariables, TContext>({
    // --- Mutation Function ---
    mutationFn: async (payload: TVariables): Promise<TData> => {
      let queryBuilder = supabase.from(table);
      let response: any;

      switch (action) {
        case "insert":
          response = await queryBuilder.insert(payload as any).select(); // Luôn select để lấy data trả về
          break;
        case "update":
          if (typeof payload === "object" && payload && primaryKey in payload) {
            const { [primaryKey]: id, ...data } = payload as any;
            if (id === undefined || id === null)
              throw new Error(
                `Update failed: '${primaryKey}' is missing in payload.`
              );
            response = await queryBuilder
              .update(data)
              .match({ [primaryKey]: id })
              .select();
          } else {
            throw new Error(
              `Invalid update payload for table '${table}'. Expecting object with '${primaryKey}'.`
            );
          }
          break;
        case "delete": // Hard delete
          if (typeof payload === "object" && payload && primaryKey in payload) {
            const id = (payload as any)[primaryKey];
            if (id === undefined || id === null)
              throw new Error(
                `Delete failed: '${primaryKey}' is missing in payload.`
              );
            response = await queryBuilder.delete().match({ [primaryKey]: id });
            // Delete thường không trả về data, chỉ trả về error hoặc null
            if (response.error) throw response.error;
            return {} as TData; // Trả về object rỗng để nhất quán kiểu trả về (hoặc null)
          } else {
            throw new Error(
              `Invalid delete payload for table '${table}'. Expecting object with '${primaryKey}'.`
            );
          }
        case "upsert":
          response = await queryBuilder
            .upsert(payload as any, {
              onConflict: (payload as any).onConflict || primaryKey, // Cho phép tùy chỉnh onConflict
            })
            .select();
          break;
        case "softDelete":
          if (typeof payload === "object" && payload && primaryKey in payload) {
            const id = (payload as any)[primaryKey];
            if (id === undefined || id === null)
              throw new Error(
                `Soft delete failed: '${primaryKey}' is missing in payload.`
              );
            // Thực hiện update để set deleted_at
            response = await queryBuilder
              .update({ deleted_at: new Date().toISOString() } as any)
              .match({ [primaryKey]: id })
              .select();
          } else {
            throw new Error(
              `Invalid soft delete payload for table '${table}'. Expecting object with '${primaryKey}'.`
            );
          }
          break;
        default:
          throw new Error(`Unsupported mutation action: ${action}`);
      }

      if (response.error) {
        console.error(
          `Supabase mutation error (${action} on ${table}):`,
          response.error
        );
        throw response.error;
      }
      // Supabase trả về mảng data, kể cả khi chỉ mutate 1 dòng
      return (response.data ?? []) as TData;
    },

    // --- Optimistic Update Logic ---
    onMutate: async (variables: TVariables): Promise<TContext> => {
      const defaultContext = { variables } as TContext;

      // 1. Ưu tiên hàm optimistic update tùy chỉnh
      if (options?.onOptimisticUpdate) {
        // Gọi hàm tùy chỉnh và trả về context nó tạo ra
        const customContext = await options.onOptimisticUpdate(
          variables,
          defaultContext,
          queryClient
        );
        return { ...defaultContext, ...customContext }; // Gộp context mặc định và tùy chỉnh
      }

      // 2. Logic optimistic update mặc định (chỉ hoạt động tốt với query key là [table])
      const queryKeyToUpdate: QueryKey = [table]; // Giả định key chính là tên bảng
      await queryClient.cancelQueries({ queryKey: queryKeyToUpdate });
      const previousData = queryClient.getQueryData(queryKeyToUpdate);
      defaultContext.previousData = previousData; // Lưu dữ liệu cũ vào context

      try {
        queryClient.setQueryData(queryKeyToUpdate, (oldData: any) => {
          // Xử lý dữ liệu cache (thường là { data: [], count: number })
          let oldItems = Array.isArray(oldData?.data)
            ? oldData.data
            : Array.isArray(oldData)
            ? oldData
            : [];
          let newItems = oldItems;

          switch (action) {
            case "insert":
              // Giả định insert 1 item, thêm vào cuối
              // Cần ID tạm thời cho key của React
              newItems = [
                ...oldItems,
                { [primaryKey]: `optimistic-${Date.now()}`, ...variables },
              ];
              break;
            case "update":
            case "softDelete": // Xử lý tương tự update cho UI
              if (
                typeof variables === "object" &&
                variables &&
                primaryKey in variables
              ) {
                const id = (variables as any)[primaryKey];
                newItems = oldItems.map((item: any) =>
                  item[primaryKey] === id ? { ...item, ...variables } : item
                );
              }
              break;
            case "delete":
              if (
                typeof variables === "object" &&
                variables &&
                primaryKey in variables
              ) {
                const id = (variables as any)[primaryKey];
                newItems = oldItems.filter(
                  (item: any) => item[primaryKey] !== id
                );
              }
              break;
            // Upsert khó đoán trước nên không làm optimistic mặc định
            case "upsert":
            default:
              newItems = oldItems; // Không thay đổi cache
              break;
          }

          // Trả về cấu trúc cache gốc nếu có
          return oldData?.data ? { ...oldData, data: newItems } : newItems;
        });
      } catch (error) {
        console.error("Optimistic update failed:", error);
        // Không cần throw lỗi ở đây, để mutation tiếp tục
      }

      return defaultContext;
    },

    // --- Error Handling ---
    onError: (error: TError, variables: TVariables, context?: TContext) => {
      console.error("Mutation failed:", error);
      // Rollback nếu có dữ liệu cũ trong context
      if (context?.previousData !== undefined) {
        const queryKeyToRollback: QueryKey = [table]; // Giả định key chính là tên bảng
        queryClient.setQueryData(queryKeyToRollback, context.previousData);
        console.log(
          `Rolled back optimistic update for key: ${queryKeyToRollback}`
        );
      }
      // Gọi thêm mutationOptions.onError nếu có
      options?.mutationOptions?.onError?.(error, variables, context);
    },

    // --- Success Handling ---
    onSuccess: (data: TData, variables: TVariables, context?: TContext) => {
      console.log(`Mutation successful (${action} on ${table})`);
      // Invalidate queries để lấy dữ liệu mới nhất từ server
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      } else {
        // Mặc định invalidate theo table
        queryClient.invalidateQueries({ queryKey: [table], exact: false });
      }
      // Gọi thêm mutationOptions.onSuccess nếu có
      options?.mutationOptions?.onSuccess?.(data, variables, context);
    },

    // --- Settled Handling ---
    onSettled: (data, error, variables, context) => {
      // Luôn chạy sau onSuccess hoặc onError
      // Gọi thêm mutationOptions.onSettled nếu có
      options?.mutationOptions?.onSettled?.(data, error, variables, context);
    },

    // Spread các options còn lại từ mutationOptions
    ...options?.mutationOptions,
  });
}
