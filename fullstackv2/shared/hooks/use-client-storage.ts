import { createClient } from "@/shared/supabase/client";
import type { Database } from "@/shared/types";
import type { StorageBuckets } from "@/shared/types/hooks";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
  type QueryKey,
} from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { StorageError, type FileObject } from "@supabase/storage-js";
import type { SupabaseClient } from "@supabase/supabase-js";

// Explicitly type the client
const supabase: SupabaseClient<Database> = createClient();

// --- Upload Hook (Types and Implementation) ---

/** Options for creating a structured file path based on conventions. */
interface CreatePathOptions {
  id?: string | number;
  prefix?: string;
  fileName?: string;
  fileExtension?: string;
}

/** Generates a file path based on common conventions. */
function createFilePath(options?: CreatePathOptions): string {
  const { id, prefix, fileName, fileExtension } = options || {};
  const uuid = uuidv4();
  let path = "";

  if (prefix) path += `${prefix}/`;
  if (id) path += `${String(id)}/`; // Convert id to string
  path += fileName || uuid;
  if (fileExtension) path += `.${fileExtension}`;
  path = path.replace(/\/+/g, "/").replace(/^\/|\/$/g, "");
  if (!path) throw new Error("Generated file path is empty."); // Add check
  return path;
}

/** Input type for the upload mutation */
interface UploadMutationVariables {
  file: File;
  fileOptions?: {
    contentType?: string;
    cacheControl?: string;
    upsert?: boolean;
  };
  path?: string;
  createPathOptions?: CreatePathOptions;
}

/** Return type for the upload mutation */
interface UploadMutationResult {
  publicUrl: string;
  path: string;
}

/** Options for the useStorageUpload hook */
interface UseStorageUploadOptions {
  invalidateQueryKeys?: QueryKey[];
  mutationOptions?: Omit<
    UseMutationOptions<
      UploadMutationResult,
      StorageError,
      UploadMutationVariables,
      unknown
    >,
    "mutationFn"
  >;
}

/**
 * Base hook for uploading a file to a Supabase Storage bucket using TanStack Query.
 */
export function useStorageUpload(
  bucket: StorageBuckets,
  options?: UseStorageUploadOptions
) {
  const queryClient = useQueryClient();
  const { invalidateQueryKeys = [], mutationOptions = {} } = options || {};

  return useMutation<
    UploadMutationResult,
    StorageError,
    UploadMutationVariables
  >({
    mutationFn: async ({
      file,
      fileOptions,
      path: explicitPath,
      createPathOptions,
    }) => {
      let filePath: string;
      if (explicitPath) {
        filePath = explicitPath;
      } else {
        const fileExtension = file.name.includes(".")
          ? file.name.split(".").pop()
          : undefined;
        filePath = createFilePath({
          ...(createPathOptions || {}),
          fileExtension: createPathOptions?.fileExtension || fileExtension,
        });
      }
      filePath = filePath.replace(/\/+/g, "/").replace(/^\/|\/$/g, ""); // Normalize

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: fileOptions?.cacheControl ?? "3600",
          contentType: fileOptions?.contentType ?? file.type,
          upsert: fileOptions?.upsert ?? true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl)
        throw new StorageError(
          `Could not retrieve public URL after upload for path: ${filePath}`
        );

      return { publicUrl: urlData.publicUrl, path: filePath };
    },
    onSuccess: (result, variables, context) => {
      invalidateQueryKeys.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key })
      );
      if (mutationOptions.onSuccess) {
        mutationOptions.onSuccess(result, variables, context);
      }
    },
    onError: (error, variables, context) => {
      console.error(`Storage upload error (bucket: ${bucket}):`, error);
      if (mutationOptions.onError) {
        mutationOptions.onError(error, variables, context);
      }
    },
    ...mutationOptions,
  });
}

// --- Delete Hook (Types and Implementation) ---

/** Input type for the delete mutation */
type DeleteMutationVariables = string | string[];

/** Return type for the delete mutation */
interface DeleteMutationResult {
  data: FileObject[] | null; // Supabase remove returns FileObject[] on success
}

/** Options for the useStorageDelete hook */
interface UseStorageDeleteOptions {
  invalidateQueryKeys?: QueryKey[];
  mutationOptions?: Omit<
    UseMutationOptions<
      DeleteMutationResult,
      StorageError,
      DeleteMutationVariables,
      unknown
    >,
    "mutationFn"
  >;
}

/**
 * Base hook for deleting one or more files from a Supabase Storage bucket.
 */
export function useStorageDelete(
  bucket: StorageBuckets,
  options?: UseStorageDeleteOptions
) {
  const queryClient = useQueryClient();
  const { invalidateQueryKeys = [], mutationOptions = {} } = options || {};

  return useMutation<
    DeleteMutationResult,
    StorageError,
    DeleteMutationVariables
  >({
    mutationFn: async (pathsToDelete) => {
      const pathsArray = Array.isArray(pathsToDelete)
        ? pathsToDelete
        : [pathsToDelete];
      if (pathsArray.length === 0) return { data: [] };
      const normalizedPaths = pathsArray.map((p) =>
        p.replace(/\/+/g, "/").replace(/^\/|\/$/g, "")
      );

      const { data, error } = await supabase.storage
        .from(bucket)
        .remove(normalizedPaths);

      if (error) throw error;
      return { data };
    },
    onSuccess: (result, variables, context) => {
      invalidateQueryKeys.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key })
      );
      if (mutationOptions.onSuccess) {
        mutationOptions.onSuccess(result, variables, context);
      }
    },
    onError: (error, variables, context) => {
      console.error(`Storage delete error (bucket: ${bucket}):`, error);
      if (mutationOptions.onError) {
        mutationOptions.onError(error, variables, context);
      }
    },
    ...mutationOptions,
  });
}

// --- List Hook (Types and Implementation) ---

/** Options for the Supabase storage `list` method */
interface SupabaseListOptions {
  limit?: number;
  offset?: number;
  sortBy?: {
    column?: "name" | "updated_at" | "created_at" | "last_accessed_at" | "size";
    order?: "asc" | "desc";
  }; // More specific column types
  search?: string; // Added search option based on storage-js
}

/** Options for the useStorageList hook */
interface UseStorageListOptions {
  queryOptions?: Omit<
    UseQueryOptions<FileObject[], StorageError>,
    "queryKey" | "queryFn"
  >;
  listOptions?: SupabaseListOptions;
}

/**
 * Base hook for listing files within a specific path in a Supabase Storage bucket.
 */
export function useStorageList(
  bucket: StorageBuckets,
  path = "",
  options?: UseStorageListOptions
) {
  const normalizedPath = path.replace(/\/+/g, "/").replace(/^\/|\/$/g, "");
  // Include listOptions in the query key for proper caching based on parameters
  const queryKey: QueryKey = [
    "storage",
    bucket,
    "list",
    normalizedPath || "/",
    options?.listOptions || {},
  ];

  return useQuery<FileObject[], StorageError>({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(bucket)
        // Pass undefined for root path if normalizedPath is empty
        .list(normalizedPath || undefined, options?.listOptions);

      if (error) throw error;
      // Handle case where path doesn't exist (Supabase returns null)
      return data ?? [];
    },
    ...options?.queryOptions,
  });
}
