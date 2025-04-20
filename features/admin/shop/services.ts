import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";
import type { ShopSettingsFormValues, ShopSettings } from "./types";

/**
 * Lấy shop settings cho admin (client-side)
 */
export async function fetchAdminShopSettings(): Promise<ShopSettings | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("shop_settings")
    .select("*")
    .order("id", { ascending: true })
    .limit(1)
    .single();
  if (error) {
    console.error("Error fetching shop settings:", error);
    return null;
  }
  return data;
}

/**
 * Cập nhật shop settings cho admin (client-side, không validate)
 */
export async function updateAdminShopSettings(
  id: number,
  values: Partial<ShopSettingsFormValues>
): Promise<ShopSettings> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("shop_settings")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    throw error;
  }
  return data;
}

/**
 * Upload logo mới cho shop (client-side, không validate)
 */
export async function uploadShopLogo({
  file,
  id,
  oldLogoUrl,
}: {
  file: File;
  id: number;
  oldLogoUrl: string | null;
}): Promise<ShopSettings> {
  const supabase = getSupabaseBrowserClient();
  // Xóa logo cũ nếu có
  if (oldLogoUrl) {
    try {
      const urlParts = oldLogoUrl.split("/");
      const bucketName = "logos";
      const bucketIndex = urlParts.findIndex((part) => part === bucketName);
      if (bucketIndex !== -1) {
        const filePath = urlParts.slice(bucketIndex + 1).join("/");
        await supabase.storage.from(bucketName).remove([filePath]);
      }
    } catch {}
  }
  // Upload file mới
  const fileExt = file.name.split(".").pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `shop/${fileName}`;
  const { error: uploadError } = await supabase.storage
    .from("logos")
    .upload(filePath, file);
  if (uploadError) throw uploadError;
  const { data: publicUrlData } = supabase.storage
    .from("logos")
    .getPublicUrl(filePath);
  // Update DB
  const { data, error: updateError } = await supabase
    .from("shop_settings")
    .update({ shop_logo_url: publicUrlData.publicUrl })
    .eq("id", id)
    .select()
    .single();
  if (updateError) throw updateError;
  return data;
}

/**
 * Xóa logo shop (client-side, không validate)
 */
export async function deleteShopLogo({
  id,
  logoUrl,
}: {
  id: number;
  logoUrl: string;
}): Promise<ShopSettings> {
  const supabase = getSupabaseBrowserClient();
  try {
    const urlParts = logoUrl.split("/");
    const bucketName = "logos";
    const bucketIndex = urlParts.findIndex((part) => part === bucketName);
    if (bucketIndex !== -1) {
      const filePath = urlParts.slice(bucketIndex + 1).join("/");
      await supabase.storage.from(bucketName).remove([filePath]);
    }
  } catch {}
  const { data, error: updateError } = await supabase
    .from("shop_settings")
    .update({ shop_logo_url: null })
    .eq("id", id)
    .select()
    .single();
  if (updateError) throw updateError;
  return data;
}
