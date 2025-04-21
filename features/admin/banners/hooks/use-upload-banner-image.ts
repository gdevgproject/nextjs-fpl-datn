"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";

export function useUploadBannerImage() {
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      path,
      fileOptions = {},
      createPathOptions = {},
    }: {
      file: File;
      path?: string;
      fileOptions?: {
        contentType?: string;
        upsert?: boolean;
      };
      createPathOptions?: {
        fileExtension?: string;
        prefix?: string;
      };
    }) => {
      if (!file) {
        throw new Error("No file provided");
      }

      // If no explicit path is provided, create one using UUID
      if (!path) {
        const fileExt =
          createPathOptions.fileExtension || file.name.split(".").pop();
        const prefix = createPathOptions.prefix || "";
        path = `${prefix ? prefix + "/" : ""}${uuidv4()}.${fileExt}`;
      }

      // Upload the file
      const { data, error } = await supabase.storage
        .from("banners")
        .upload(path, file, {
          contentType: fileOptions.contentType || file.type,
          upsert: fileOptions.upsert || false,
        });

      if (error) {
        throw error;
      }

      // Get the public URL
      const publicUrl = supabase.storage
        .from("banners")
        .getPublicUrl(data?.path || path).data.publicUrl;

      return {
        ...data,
        publicUrl,
        path: data?.path || path,
      };
    },
    onSuccess: () => {
      // Invalidate and refetch banners list query
      queryClient.invalidateQueries({ queryKey: ["banners", "list"] });
    },
  });
}
