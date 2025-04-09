import { createClient } from "@/shared/supabase/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
} from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid"; // For generating unique file names
import { StorageError, FileObject } from "@supabase/storage-js"; // Import specific types

const supabase = createClient();

/**
 * Options for creating a structured file path based on conventions.
 */
interface CreatePathOptions {
  /** Optional ID of the related entity (e.g., user_id, product_id). Used as a directory. */
  id?: string | number;
  /** Optional prefix directory (e.g., 'brands', 'public'). */
  prefix?: string;
  /** Optional base name for the file (without extension). Defaults to UUID. */
  fileName?: string;
  /** Optional file extension (e.g., 'png', 'jpg'). If not provided, extracted from original file name. */
  fileExtension?: string;
}

/**
 * Generates a file path based on common conventions.
 * Example conventions:
 * - avatars:    `[user_id]/[uuid].[ext]`
 * - logos:      `brands/[brand_id]/logo.[ext]` or `shop/logo.[ext]`
 * - products:   `products/[product_id]/[uuid].[ext]`
 * - banners:    `banners/[banner_id]/image.[ext]` or `banners/[uuid].[ext]`
 * - categories: `categories/[category_id]/image.[ext]`
 *
 * @param options Configuration for path generation.
 * @returns The generated file path string.
 */
function createFilePath(options?: CreatePathOptions): string {
  const { id, prefix, fileName, fileExtension } = options || {};
  const uuid = uuidv4();
  let path = "";

  if (prefix) path += `${prefix}/`;
  if (id) path += `${id}/`;

  // Ensure trailing slash if prefix or id exists but no filename yet
  if ((prefix || id) && !fileName)
    path += ""; // No extra slash needed if filename follows
  else if (prefix || id) path += ""; // Add slash if needed? Let's test this. No, usually handled by storage.

  // Use provided filename or generate UUID
  path += fileName || uuid;

  // Add extension if provided
  if (fileExtension) path += `.${fileExtension}`;

  // Normalize path: remove leading/trailing slashes and excessive slashes
  path = path.replace(/\/+/g, "/").replace(/^\/|\/$/g, "");

  return path;
}

/** Input type for the upload mutation */
interface UploadMutationVariables {
  /** The file object to upload. */
  file: File;
  /** Optional file metadata and upload options. */
  fileOptions?: {
    /** Content type of the file (e.g., 'image/png'). Defaults to file.type. */
    contentType?: string;
    /** Cache control header value (e.g., 'public, max-age=3600'). Defaults to '3600'. */
    cacheControl?: string;
    /** Set to true to overwrite existing file with same path. Defaults to true. */
    upsert?: boolean;
  };
  /** If provided, uses this exact path. Overrides `createPathOptions`. */
  path?: string;
  /** If provided (and `path` is not), generates path using these options. */
  createPathOptions?: CreatePathOptions;
}

/** Return type for the upload mutation */
interface UploadMutationResult {
  /** The public URL of the uploaded file. */
  publicUrl: string;
  /** The final path where the file was stored. */
  path: string;
}

/** Options for the useStorageUpload hook */
interface UseStorageUploadOptions {
  /** Optional query key(s) to invalidate after successful upload. */
  invalidateQueryKeys?: QueryKey[];
  /** Optional callback function executed on successful upload. */
  onSuccess?: (
    result: UploadMutationResult,
    variables: UploadMutationVariables
  ) => void;
  /** Optional callback function executed on error. */
  onError?: (error: StorageError, variables: UploadMutationVariables) => void;
  /** Additional options for the underlying `useMutation` hook. */
  mutationOptions?: Omit<
    UseMutationOptions<
      UploadMutationResult,
      StorageError,
      UploadMutationVariables
    >,
    "mutationFn" | "onSuccess" | "onError"
  >;
}

/**
 * Base hook for uploading a file to a Supabase Storage bucket using TanStack Query.
 * Handles file path generation based on conventions and provides public URL.
 *
 * @param bucket The name of the Supabase Storage bucket.
 * @param options Configuration options for the upload hook.
 * @returns The result object from `useMutation`. Call `.mutate(variables)` or `.mutateAsync(variables)`.
 */
export function useStorageUpload(
  bucket: string,
  options?: UseStorageUploadOptions
) {
  const queryClient = useQueryClient();

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
    }: UploadMutationVariables) => {
      let filePath: string;

      // Determine the file path
      if (explicitPath) {
        filePath = explicitPath;
      } else {
        // Try to get extension from file, default if not possible
        const fileExtension = file.name.includes(".")
          ? file.name.split(".").pop()
          : undefined;
        filePath = createFilePath({
          ...(createPathOptions || {}), // Use provided creation options
          fileExtension: createPathOptions?.fileExtension || fileExtension, // Prioritize provided ext
        });
      }

      // Normalize path just in case
      filePath = filePath.replace(/\/+/g, "/").replace(/^\/|\/$/g, "");
      if (!filePath) throw new Error("Generated file path is empty.");

      // Upload the file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: fileOptions?.cacheControl ?? "3600", // Default cache
          contentType: fileOptions?.contentType ?? file.type, // Default content type
          upsert: fileOptions?.upsert ?? true, // Default upsert
        });

      if (uploadError) {
        console.error(
          `Supabase Storage upload error (bucket: ${bucket}, path: ${filePath}):`,
          uploadError
        );
        throw uploadError;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        // This usually shouldn't happen if upload succeeded, but handle defensively
        console.warn(
          `Could not get public URL for uploaded file (bucket: ${bucket}, path: ${filePath}). Upload might have succeeded partially.`
        );
        // Decide: throw error or return path only? Returning path might be okay.
        // Let's throw for now to indicate an issue.
        throw new StorageError(
          `Could not retrieve public URL after upload for path: ${filePath}`
        );
      }

      return { publicUrl: urlData.publicUrl, path: filePath };
    },
    onSuccess: (result, variables, context) => {
      // Invalidate specified query keys
      if (options?.invalidateQueryKeys) {
        options.invalidateQueryKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }

      // Call user-defined onSuccess callback
      options?.onSuccess?.(result, variables);

      // Call original onSuccess from mutationOptions if provided
      options?.mutationOptions?.onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      // Call user-defined onError callback
      options?.onError?.(error, variables);

      // Call original onError from mutationOptions if provided
      options?.mutationOptions?.onError?.(error, variables, context);
    },
    ...options?.mutationOptions, // Spread remaining mutation options
  });
}

// --- Delete Hook ---

/** Input type for the delete mutation */
type DeleteMutationVariables = string | string[]; // File path or array of paths

/** Return type for the delete mutation */
interface DeleteMutationResult {
  /** Array of successfully deleted file objects (might be empty on error). */
  data: FileObject[] | null;
}

/** Options for the useStorageDelete hook */
interface UseStorageDeleteOptions {
  /** Optional query key(s) to invalidate after successful deletion. */
  invalidateQueryKeys?: QueryKey[];
  /** Optional callback function executed on successful deletion. */
  onSuccess?: (
    result: DeleteMutationResult,
    variables: DeleteMutationVariables
  ) => void;
  /** Optional callback function executed on error. */
  onError?: (error: StorageError, variables: DeleteMutationVariables) => void;
  /** Additional options for the underlying `useMutation` hook. */
  mutationOptions?: Omit<
    UseMutationOptions<
      DeleteMutationResult,
      StorageError,
      DeleteMutationVariables
    >,
    "mutationFn" | "onSuccess" | "onError"
  >;
}

/**
 * Base hook for deleting one or more files from a Supabase Storage bucket using TanStack Query.
 *
 * @param bucket The name of the Supabase Storage bucket.
 * @param options Configuration options for the delete hook.
 * @returns The result object from `useMutation`. Call `.mutate(pathOrPaths)` or `.mutateAsync(pathOrPaths)`.
 */
export function useStorageDelete(
  bucket: string,
  options?: UseStorageDeleteOptions
) {
  const queryClient = useQueryClient();

  return useMutation<
    DeleteMutationResult,
    StorageError,
    DeleteMutationVariables
  >({
    mutationFn: async (pathsToDelete: DeleteMutationVariables) => {
      const pathsArray = Array.isArray(pathsToDelete)
        ? pathsToDelete
        : [pathsToDelete];

      if (pathsArray.length === 0) {
        console.warn("useStorageDelete called with empty paths array.");
        return { data: [] }; // Nothing to delete
      }

      // Normalize paths
      const normalizedPaths = pathsArray.map((p) =>
        p.replace(/\/+/g, "/").replace(/^\/|\/$/g, "")
      );

      const { data, error } = await supabase.storage
        .from(bucket)
        .remove(normalizedPaths);

      if (error) {
        console.error(
          `Supabase Storage delete error (bucket: ${bucket}):`,
          error
        );
        throw error;
      }

      return { data };
    },
    onSuccess: (result, variables, context) => {
      if (options?.invalidateQueryKeys) {
        options.invalidateQueryKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
      options?.onSuccess?.(result, variables);
      options?.mutationOptions?.onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables);
      options?.mutationOptions?.onError?.(error, variables, context);
    },
    ...options?.mutationOptions,
  });
}

// --- List Hook ---

/** Options for the useStorageList hook */
interface UseStorageListOptions {
  /** Standard react-query options like `enabled`, `staleTime` etc. */
  queryOptions?: Omit<
    UseQueryOptions<FileObject[], StorageError>,
    "queryKey" | "queryFn"
  >;
  /** Options for the Supabase `list` method itself. */
  listOptions?: {
    limit?: number;
    offset?: number;
    sortBy?: {
      column?: string;
      order?: string;
    };
    search?: string;
  };
}

/**
 * Base hook for listing files within a specific path in a Supabase Storage bucket using TanStack Query.
 *
 * @param bucket The name of the Supabase Storage bucket.
 * @param path The directory path within the bucket to list files from. Empty string lists root.
 * @param options Configuration options for the list hook.
 * @returns The result object from `useQuery`.
 */
export function useStorageList(
  bucket: string,
  path: string = "", // Default to root path
  options?: UseStorageListOptions
) {
  // Normalize path for the query key
  const normalizedPath = path.replace(/\/+/g, "/").replace(/^\/|\/$/g, "");
  const queryKey: QueryKey = [
    "storage",
    bucket,
    "list",
    normalizedPath,
    options?.listOptions,
  ]; // Include listOptions in key

  return useQuery<FileObject[], StorageError>({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(normalizedPath || undefined, options?.listOptions); // Pass listOptions

      if (error) {
        console.error(
          `Supabase Storage list error (bucket: ${bucket}, path: ${normalizedPath}):`,
          error
        );
        throw error;
      }
      // Supabase list returns null if the path doesn't exist, handle this
      return data ?? [];
    },
    ...options?.queryOptions, // Spread standard react-query options
  });
}
