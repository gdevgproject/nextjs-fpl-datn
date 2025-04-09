import { createClient } from "@/shared/supabase/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
} from "@tanstack/react-query";
import { StorageError } from "@supabase/storage-js";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient();

/**
 * [V3 Base Hooks] Tạo đường dẫn file theo quy ước chung.
 * @param bucket Tên bucket.
 * @param options Tùy chọn tạo path.
 * @param options.entityId ID của thực thể liên quan (user_id, product_id,...).
 * @param options.fileName Tên file mong muốn (không bao gồm extension). Nếu không có, dùng UUID.
 * @param options.fileExtension Extension của file (vd: 'jpg', 'png').
 * @returns Đường dẫn file hoàn chỉnh.
 * @example createFilePath('avatars', { entityId: 'user-123', fileExtension: 'png' }) -> 'user-123/uuid-v4.png'
 * @example createFilePath('products', { entityId: 101, fileName: 'main-image', fileExtension: 'webp' }) -> '101/main-image.webp'
 */
function createFilePath(
  bucket: string, // Thêm bucket vào để có thể dùng cho logic phức tạp hơn nếu cần
  options: {
    entityId?: string | number;
    fileName?: string;
    fileExtension?: string;
  }
): string {
  const { entityId, fileName, fileExtension } = options;
  const uuidName = uuidv4(); // Luôn tạo UUID để dùng nếu fileName không có

  let pathSegments: string[] = [];

  // 1. Thêm entityId làm thư mục nếu có
  if (entityId !== undefined && entityId !== null && entityId !== "") {
    pathSegments.push(String(entityId));
  }

  // 2. Xác định tên file chính
  const baseFileName = fileName || uuidName;
  pathSegments.push(baseFileName);

  // 3. Ghép lại và thêm extension
  let finalPath = pathSegments.join("/");
  if (fileExtension) {
    finalPath += `.${fileExtension.toLowerCase().replace(".", "")}`; // Đảm bảo extension sạch
  }

  console.log(`Generated storage path for bucket '${bucket}': ${finalPath}`);
  return finalPath;
}

/**
 * [V3 Base Hooks] Tùy chọn cho useClientStorageUpload.
 */
type ClientStorageUploadOptions = {
  /**
   * Cung cấp path tĩnh nếu không muốn tự động tạo. Sẽ ghi đè createPath.
   */
  path?: string;
  /**
   * Tùy chọn để tự động tạo path theo quy ước [entityId]/[uuid|fileName].[ext].
   */
  createPath?: {
    entityId?: string | number; // ID của user, product, category...
    fileName?: string; // Tên file mong muốn (không có ext), nếu không sẽ dùng UUID
  };
  /**
   * Query key để invalidate sau khi upload thành công.
   */
  cacheKeysToInvalidate?: QueryKey[];
  /**
   * Callback sau khi upload thành công.
   */
  onSuccess?: (result: { publicUrl: string; path: string }) => void;
  /**
   * Các tùy chọn khác của useMutation (TanStack Query).
   */
  mutationOptions?: Omit<
    UseMutationOptions<
      { publicUrl: string; path: string },
      StorageError,
      { file: File; fileOptions?: SupabaseStorageOptions }
    >,
    "mutationFn"
  >;
};

type SupabaseStorageOptions = {
  cacheControl?: string;
  contentType?: string;
  upsert?: boolean;
};

/**
 * [V3 Base Hooks] Hook để upload file lên Supabase Storage.
 * Tự động tạo path theo quy ước nếu không cung cấp path tĩnh.
 *
 * @param bucket Tên bucket cần upload tới.
 * @param options Các tùy chọn upload.
 */
export function useClientStorageUpload(
  bucket: string,
  options?: ClientStorageUploadOptions
) {
  const queryClient = useQueryClient();

  return useMutation<
    { publicUrl: string; path: string },
    StorageError,
    { file: File; fileOptions?: SupabaseStorageOptions }
  >({
    mutationFn: async ({
      file,
      fileOptions,
    }): Promise<{ publicUrl: string; path: string }> => {
      // --- Xác định đường dẫn file ---
      let filePath: string;
      const fileExtension = file.name.split(".").pop();

      if (options?.path) {
        // 1. Dùng path tĩnh nếu được cung cấp
        filePath = options.path;
      } else if (options?.createPath) {
        // 2. Tạo path động theo quy ước
        filePath = createFilePath(bucket, {
          ...options.createPath,
          fileExtension: fileExtension,
        });
      } else {
        // 3. Mặc định: chỉ dùng UUID + extension ở thư mục gốc (nên tránh)
        console.warn(
          `Uploading to bucket '${bucket}' root using default UUID naming. Consider using 'createPath' option for better organization.`
        );
        filePath = `${uuidv4()}${fileExtension ? "." + fileExtension : ""}`;
      }

      // --- Upload file ---
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: fileOptions?.cacheControl ?? "3600", // Mặc định 1 giờ
          contentType: fileOptions?.contentType ?? file.type,
          upsert: fileOptions?.upsert ?? true, // Mặc định là true để ghi đè nếu path tồn tại
        });

      if (uploadError) {
        console.error(
          `Supabase storage upload error (bucket: ${bucket}, path: ${filePath}):`,
          uploadError
        );
        throw uploadError;
      }

      // --- Lấy public URL ---
      // Lưu ý: Nếu bucket không public, bước này sẽ không hoạt động đúng hoặc trả về URL có token
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        console.warn(
          `Could not get public URL for uploaded file (bucket: ${bucket}, path: ${filePath}). Is the bucket public?`
        );
        // Vẫn trả về path để lưu vào DB nếu cần
        return { publicUrl: "", path: filePath };
      }

      return { publicUrl: urlData.publicUrl, path: filePath };
    },
    onSuccess: (result, variables, context) => {
      console.log(`File uploaded successfully to ${bucket}/${result.path}`);
      // Invalidate cache nếu cần
      if (options?.cacheKeysToInvalidate) {
        options.cacheKeysToInvalidate.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
      // Callback onSuccess
      options?.onSuccess?.(result);
      // Gọi onSuccess từ options nếu có
      options?.mutationOptions?.onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error("Storage upload failed:", error);
      options?.mutationOptions?.onError?.(error, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      options?.mutationOptions?.onSettled?.(data, error, variables, context);
    },
    ...options?.mutationOptions,
  });
}

/**
 * [V3 Base Hooks] Tùy chọn cho useClientStorageDelete / useClientStorageBatchDelete.
 */
type ClientStorageDeleteOptions = {
  /**
   * Query key để invalidate sau khi xóa thành công.
   */
  cacheKeysToInvalidate?: QueryKey[];
  /**
   * Callback sau khi xóa thành công.
   */
  onSuccess?: () => void;
  /**
   * Các tùy chọn khác của useMutation (TanStack Query).
   */
  mutationOptions?: Omit<
    UseMutationOptions<any, StorageError, any>,
    "mutationFn"
  >; // any vì kiểu trả về và biến có thể khác nhau
};

/**
 * [V3 Base Hooks] Hook để xóa MỘT file khỏi Supabase Storage.
 *
 * @param bucket Tên bucket chứa file.
 * @param options Các tùy chọn xóa.
 */
export function useClientStorageDelete(
  bucket: string,
  options?: ClientStorageDeleteOptions
) {
  const queryClient = useQueryClient();

  return useMutation<void, StorageError, string>({
    // Biến là path (string)
    mutationFn: async (path: string): Promise<void> => {
      if (!path) {
        console.warn("Attempted to delete storage file with empty path.");
        return; // Không làm gì nếu path rỗng
      }
      const { error } = await supabase.storage.from(bucket).remove([path]); // remove nhận mảng path

      if (error) {
        console.error(
          `Supabase storage delete error (bucket: ${bucket}, path: ${path}):`,
          error
        );
        throw error;
      }
    },
    onSuccess: (data, variables, context) => {
      console.log(`File deleted successfully from ${bucket}/${variables}`);
      if (options?.cacheKeysToInvalidate) {
        options.cacheKeysToInvalidate.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
      options?.onSuccess?.();
      options?.mutationOptions?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error("Storage delete failed:", error);
      options?.mutationOptions?.onError?.(error, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      options?.mutationOptions?.onSettled?.(data, error, variables, context);
    },
    ...options?.mutationOptions,
  });
}

/**
 * [V3 Base Hooks] Hook để xóa NHIỀU file khỏi Supabase Storage.
 *
 * @param bucket Tên bucket chứa các file.
 * @param options Các tùy chọn xóa.
 */
export function useClientStorageBatchDelete(
  bucket: string,
  options?: ClientStorageDeleteOptions
) {
  const queryClient = useQueryClient();

  return useMutation<void, StorageError, string[]>({
    // Biến là mảng path (string[])
    mutationFn: async (paths: string[]): Promise<void> => {
      const validPaths = paths.filter((p) => p); // Lọc bỏ path rỗng
      if (validPaths.length === 0) {
        console.warn(
          "Attempted to batch delete storage files with empty path list."
        );
        return;
      }
      const { error } = await supabase.storage.from(bucket).remove(validPaths);

      if (error) {
        console.error(
          `Supabase storage batch delete error (bucket: ${bucket}):`,
          error
        );
        throw error;
      }
    },
    onSuccess: (data, variables, context) => {
      console.log(
        `Batch files deleted successfully from ${bucket}: ${variables.length} items`
      );
      if (options?.cacheKeysToInvalidate) {
        options.cacheKeysToInvalidate.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
      options?.onSuccess?.();
      options?.mutationOptions?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error("Storage batch delete failed:", error);
      options?.mutationOptions?.onError?.(error, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      options?.mutationOptions?.onSettled?.(data, error, variables, context);
    },
    ...options?.mutationOptions,
  });
}

/**
 * [V3 Base Hooks] Hook để lấy danh sách file trong một thư mục của Supabase Storage.
 *
 * @param bucket Tên bucket.
 * @param path Đường dẫn thư mục cần list (có thể rỗng để list thư mục gốc).
 * @param options Các tùy chọn khác của useQuery (TanStack Query).
 */
export function useClientStorageList(
  bucket: string,
  path: string = "", // Mặc định list thư mục gốc
  options?: Omit<UseQueryOptions<any[], StorageError>, "queryKey" | "queryFn"> // Kiểu trả về là FileObject[] nhưng dùng any[] cho đơn giản
) {
  const queryKey: QueryKey = ["storage", bucket, "list", path];

  return useQuery<any[], StorageError>({
    queryKey: queryKey,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path || undefined, {
          // Truyền undefined nếu path rỗng
          // limit: 100, // Có thể thêm limit, offset nếu cần
          // offset: 0,
          // sortBy: { column: 'name', order: 'asc' },
        });

      if (error) {
        console.error(
          `Supabase storage list error (bucket: ${bucket}, path: ${path}):`,
          error
        );
        throw error;
      }
      return data || [];
    },
    ...options,
  });
}
