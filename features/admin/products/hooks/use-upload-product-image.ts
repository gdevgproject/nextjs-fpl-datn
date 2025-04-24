"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StorageError } from "@supabase/storage-js";
import { v4 as uuidv4 } from "uuid";

const supabase = getSupabaseBrowserClient();

// Input type for the upload mutation
interface UploadMutationVariables {
  file: File;
  fileOptions?: {
    contentType?: string;
    cacheControl?: string;
    upsert?: boolean;
  };
  path?: string;
  createPathOptions?: {
    id?: string | number;
    prefix?: string;
    fileName?: string;
    fileExtension?: string;
  };
}

// Return type for the upload mutation
interface UploadMutationResult {
  publicUrl: string;
  path: string;
}

export function useUploadProductImage() {
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
    }) => {
      let filePath: string;

      if (explicitPath) {
        filePath = explicitPath;
      } else {
        filePath = createFilePath({
          ...createPathOptions,
          fileExtension:
            createPathOptions?.fileExtension ||
            (file.name.includes(".") ? file.name.split(".").pop() : undefined),
        });
      }

      filePath = filePath.replace(/\/+/g, "/").replace(/^\/|\/$/g, ""); // Normalize

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, file, {
          cacheControl: fileOptions?.cacheControl ?? "3600",
          contentType: fileOptions?.contentType ?? file.type,
          upsert: fileOptions?.upsert ?? true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("products")
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl)
        throw new StorageError(
          `Could not retrieve public URL after upload for path: ${filePath}`
        );

      return { publicUrl: urlData.publicUrl, path: filePath };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["product_images", "by_product"],
      });
    },
    onError: (error) => {
      console.error("Storage upload error (bucket: products):", error);
    },
  });
}

// Helper function to create a file path based on common conventions
function createFilePath(options?: {
  id?: string | number;
  prefix?: string;
  fileName?: string;
  fileExtension?: string;
}): string {
  const { id, prefix, fileName, fileExtension } = options || {};
  const uuid = uuidv4();
  let path = "";

  if (prefix) path += `${prefix}/`;
  if (id) path += `${String(id)}/`; // Convert id to string
  path += fileName || uuid;
  if (fileExtension) path += `.${fileExtension}`;
  path = path.replace(/\/+/g, "/").replace(/^\/|\/$/g, "");
  if (!path) throw new Error("Generated file path is empty.");
  return path;
}
