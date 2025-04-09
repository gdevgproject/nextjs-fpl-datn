import { createClient } from "@/shared/supabase/client";
import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
  QueryKey,
} from "@tanstack/react-query";
import { PostgrestError } from "@supabase/postgrest-js";

const supabase = createClient();

/**
 * [V3 Base Hooks] Tùy chọn cho useClientBatchMutation.
 */
type ClientBatchMutationOptions = {
  /**
   * Mảng các queryKey cần được invalidate sau khi mutation thành công.
   */
  invalidateQueries?: QueryKey[];
  /**
   * Các tùy chọn khác của useMutation (TanStack Query).
   */
  mutationOptions?: Omit<
    UseMutationOptions<any, PostgrestError, BatchPayload>,
    "mutationFn"
  >;
};

type BatchPayload = {
  action: "insert" | "update" | "delete" | "upsert";
  items: any[]; // Mảng các object cần xử lý
  matchColumn?: string; // Cột để khớp cho delete/upsert (mặc định 'id')
};

/**
 * [V3 Base Hooks] Hook cơ sở để thực hiện các thao tác batch (nhiều bản ghi cùng lúc).
 * **CẢNH BÁO:**
 * - Action 'update' thực chất là 'UPSERT' do hạn chế của Supabase JS client. Nó sẽ INSERT nếu không tìm thấy bản ghi khớp `matchColumn`. Hãy đảm bảo `items` chỉ chứa các bản ghi bạn thực sự muốn update/insert.
 * - Optimistic updates KHÔNG được hỗ trợ mặc định cho batch operations do độ phức tạp.
 * - Xử lý lỗi khi một phần của batch thất bại có thể phức tạp.
 * - **Cân nhắc:** Đối với các thao tác bulk phức tạp hoặc cần transaction, việc tạo một RPC tùy chỉnh có thể an toàn và hiệu quả hơn.
 *
 * @param table Tên bảng Supabase.
 * @param options Các tùy chọn (invalidateQueries, mutationOptions).
 */
export function useClientBatchMutation(
  table: string,
  options?: ClientBatchMutationOptions
) {
  const queryClient = useQueryClient();

  return useMutation<any, PostgrestError, BatchPayload>({
    // Kiểu trả về là any vì Supabase trả về khác nhau tùy action
    mutationFn: async ({
      action,
      items,
      matchColumn = "id", // Mặc định khớp theo 'id'
    }: BatchPayload): Promise<any> => {
      if (!items || items.length === 0) {
        console.warn(
          `Batch mutation (${action} on ${table}) called with empty items array.`
        );
        return []; // Trả về mảng rỗng
      }

      let response: any;

      try {
        switch (action) {
          case "insert":
            response = await supabase.from(table).insert(items).select();
            break;
          case "update":
            // **CẢNH BÁO:** Đây thực chất là UPSERT
            console.warn(
              `Executing batch 'update' on '${table}' using upsert. Records not matching '${matchColumn}' will be inserted.`
            );
            response = await supabase
              .from(table)
              .upsert(items, {
                onConflict: matchColumn,
                ignoreDuplicates: false, // Không bỏ qua nếu trùng
              })
              .select();
            break;
          case "delete":
            // Lấy danh sách các giá trị của matchColumn cần xóa
            const valuesToDelete = items
              .map((item) => item[matchColumn])
              .filter((val) => val !== undefined && val !== null);
            if (valuesToDelete.length === 0) {
              console.warn(
                `Batch delete on '${table}' called but no valid '${matchColumn}' values found in items.`
              );
              return [];
            }
            response = await supabase
              .from(table)
              .delete()
              .in(matchColumn, valuesToDelete);
            // Delete không trả về data
            if (response.error) throw response.error;
            return { deletedCount: response.count ?? valuesToDelete.length }; // Trả về số lượng (ước tính)
          case "upsert":
            response = await supabase
              .from(table)
              .upsert(items, {
                onConflict: matchColumn,
                ignoreDuplicates: false,
              })
              .select();
            break;
          default:
            // Ép kiểu để TypeScript không báo lỗi unreachable code
            const exhaustiveCheck: never = action;
            throw new Error(`Unsupported batch action: ${exhaustiveCheck}`);
        }

        if (response.error) throw response.error;
        return response.data ?? []; // Trả về data hoặc mảng rỗng
      } catch (error) {
        console.error(
          `Supabase batch mutation error (${action} on ${table}):`,
          error
        );
        throw error; // Re-throw để TanStack Query xử lý
      }
    },
    onSuccess: (data, variables, context) => {
      console.log(
        `Batch mutation successful (${variables.action} on ${table})`
      );
      // Invalidate queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      } else {
        // Mặc định invalidate theo table
        queryClient.invalidateQueries({ queryKey: [table], exact: false });
      }
      // Gọi onSuccess từ options nếu có
      options?.mutationOptions?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error(
        `Batch mutation failed (${variables.action} on ${table}):`,
        error
      );
      // Gọi onError từ options nếu có
      options?.mutationOptions?.onError?.(error, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      // Gọi onSettled từ options nếu có
      options?.mutationOptions?.onSettled?.(data, error, variables, context);
    },
    ...options?.mutationOptions,
  });
}
