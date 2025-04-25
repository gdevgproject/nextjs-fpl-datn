"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StorageError } from "@supabase/storage-js";
import { v4 as uuidv4 } from "uuid";
import {
  UploadProductImageVariables,
  UploadProductImageResult,
} from "../types";

const supabase = getSupabaseBrowserClient();

/**
 * Hook for uploading product images to Supabase Storage
 * Returns a mutation to handle the upload process
 */
export function useUploadProductImage() {
  const queryClient = useQueryClient();

  return useMutation<
    UploadProductImageResult,
    StorageError,
    UploadProductImageVariables
  >({
    mutationFn: async ({
      file,
      fileOptions,
      path: explicitPath,
      createPathOptions,
    }) => {
      let filePath: string;

      // Determine file path - use explicit path or create one
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

      // Normalize file path to prevent path issues
      filePath = filePath.replace(/\/+/g, "/").replace(/^\/|\/$/g, "");

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, file, {
          cacheControl: fileOptions?.cacheControl ?? "3600",
          contentType: fileOptions?.contentType ?? file.type,
          upsert: fileOptions?.upsert ?? true,
        });

      if (uploadError) throw uploadError;

      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from("products")
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl)
        throw new StorageError(
          `Could not retrieve public URL after upload for path: ${filePath}`
        );

      return { publicUrl: urlData.publicUrl, path: filePath };
    },
    onSuccess: (_, variables) => {
      // Invalidate specific related queries
      queryClient.invalidateQueries({
        queryKey: ["product_images", "by_product"],
      });

      // If we have a product ID in the path options, invalidate that specific product's images
      if (variables.createPathOptions?.id) {
        queryClient.invalidateQueries({
          queryKey: [
            "product_images",
            "by_product",
            variables.createPathOptions.id,
          ],
        });
      }
    },
    onError: (error) => {
      console.error("Storage upload error (bucket: products):", error);
    },
  });
}

/**
 * Helper function to create a standardized file path for product images
 * This ensures consistent organization in storage
 */
function createFilePath(options?: {
  id?: string | number;
  prefix?: string;
  fileName?: string;
  fileExtension?: string;
}): string {
  const { id, prefix, fileName, fileExtension } = options || {};
  const uuid = uuidv4();
  let path = "";

  // Build path with proper nesting structure
  if (prefix) path += `${prefix}/`;
  if (id) path += `${String(id)}/`; // Convert id to string
  path += fileName || uuid;
  if (fileExtension) path += `.${fileExtension}`;

  // Normalize path
  path = path.replace(/\/+/g, "/").replace(/^\/|\/$/g, "");
  if (!path) throw new Error("Generated file path is empty.");

  return path;
}
