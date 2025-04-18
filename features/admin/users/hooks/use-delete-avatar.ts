import { useMutation } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface DeleteAvatarParams {
  userId: string;
  url: string;
}

export function useDeleteAvatar() {
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async ({ userId, url }: DeleteAvatarParams) => {
      // Extract the path from the URL
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/");
      const bucketIndex = pathParts.findIndex((part) => part === "avatars");

      if (bucketIndex === -1) {
        throw new Error("Invalid avatar URL");
      }

      const filePath = pathParts.slice(bucketIndex + 1).join("/");

      // Delete the file from Supabase Storage
      const { error } = await supabase.storage
        .from("avatars")
        .remove([filePath]);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    },
  });
}
