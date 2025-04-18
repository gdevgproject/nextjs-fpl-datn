import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";

export async function uploadAvatarClient(userId: string, file: File) {
  const supabase = getSupabaseBrowserClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `user_${userId}/avatar_${uuidv4()}.${fileExt}`;
  const { error } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
  return data.publicUrl;
}
