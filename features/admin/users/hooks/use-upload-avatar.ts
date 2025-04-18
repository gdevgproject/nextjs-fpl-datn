import { useMutation } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";

interface UploadAvatarParams {
  userId: string;
  file: File;
}

export function useUploadAvatar() {
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async ({ userId, file }: UploadAvatarParams) => {
      // Generate a unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw new Error(error.message);
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(data.path);

      return {
        path: data.path,
        url: publicUrlData.publicUrl,
      };
    },
  });
}
