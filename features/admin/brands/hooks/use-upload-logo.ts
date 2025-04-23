"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";

interface UploadMutationVariables {
  file: File;
  path?: string;
  fileOptions?: {
    cacheControl?: string;
    contentType?: string;
    upsert?: boolean;
  };
  createPathOptions?: {
    brandId?: number | string;
    fileExtension?: string;
  };
}

export function useUploadBrandLogo() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async ({
      file,
      path: explicitPath,
      fileOptions,
      createPathOptions,
    }: UploadMutationVariables) => {
      // Generate a file path if not explicitly provided
      let filePath: string;

      if (explicitPath) {
        filePath = explicitPath;
      } else {
        // Extract file extension
        const fileExtension = file.name.includes(".")
          ? file.name.split(".").pop()
          : undefined;

        // Create a structured path based on branding context
        const brandId = createPathOptions?.brandId || "undefined";
        const uniqueId = uuidv4().substring(0, 8);
        const extension =
          createPathOptions?.fileExtension || fileExtension || "png";

        filePath = `brands/${brandId}/${uniqueId}.${extension}`;
      }

      // Normalize path
      filePath = filePath.replace(/\/+/g, "/").replace(/^\/|\/$/g, "");

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(filePath, file, {
          cacheControl: fileOptions?.cacheControl ?? "3600",
          contentType: fileOptions?.contentType ?? file.type,
          upsert: fileOptions?.upsert ?? true,
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("logos")
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error(
          `Could not retrieve public URL after upload for path: ${filePath}`
        );
      }

      return { publicUrl: urlData.publicUrl, path: filePath };
    },
    onSuccess: () => {
      // Invalidate brands list query to refresh data
      queryClient.invalidateQueries({ queryKey: ["brands", "list"] });
    },
    onError: (error) => {
      console.error(`Storage upload error (bucket: logos):`, error);
    },
  });
}
