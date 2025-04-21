"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  shopSettingsSchema,
  ShopSettingsFormValues,
  logoSchema,
} from "./types";
import { v4 as uuidv4 } from "uuid";

/**
 * Fetch shop settings from the database
 * @returns Shop settings data
 */
export async function getShopSettingsAction() {
  const supabase = await getSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from("shop_settings")
      .select("*")
      .order("id", { ascending: true })
      .limit(1)
      .single();

    if (error) {
      throw new Error(`Error fetching shop settings: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in getShopSettingsAction:", error);
    throw new Error(
      `Failed to fetch shop settings: ${(error as Error).message}`
    );
  }
}

/**
 * Update shop settings
 * @param id Shop settings ID
 * @param formData Form data with settings to update
 * @returns Updated shop settings
 */
export async function updateShopSettingsAction(
  id: number,
  formData: ShopSettingsFormValues
) {
  const supabase = await getSupabaseServerClient();

  try {
    // Server-side validation
    const validatedData = shopSettingsSchema.parse(formData);

    const { data, error } = await supabase
      .from("shop_settings")
      .update(validatedData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update shop settings: ${error.message}`);
    }

    // Revalidate related paths
    revalidatePath("/admin/settings/shop");
    revalidatePath("/"); // Revalidate homepage that might show shop name/logo

    return data;
  } catch (error) {
    console.error("Error in updateShopSettingsAction:", error);
    throw new Error(
      `Failed to update shop settings: ${(error as Error).message}`
    );
  }
}

/**
 * Upload logo to storage and update shop settings
 * @param id Shop settings ID
 * @param file Logo file to upload
 * @param oldLogoUrl URL of the current logo (if any) to delete
 * @returns Updated shop settings
 */
export async function uploadLogoAction(
  id: number,
  file: File,
  oldLogoUrl: string | null
) {
  const supabase = await getSupabaseServerClient();

  try {
    // Server-side validation
    const validationResult = logoSchema.safeParse({ file });
    if (!validationResult.success) {
      throw new Error(validationResult.error.errors[0].message);
    }

    // Delete old logo if exists
    if (oldLogoUrl) {
      try {
        const urlParts = oldLogoUrl.split("/");
        const bucketName = "logos";
        const bucketIndex = urlParts.findIndex((part) => part === bucketName);

        if (bucketIndex !== -1) {
          const filePath = urlParts.slice(bucketIndex + 1).join("/");
          await supabase.storage.from(bucketName).remove([filePath]);
        }
      } catch (deleteError) {
        console.warn("Error deleting old logo:", deleteError);
        // Continue with upload even if delete fails
      }
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `shop/${fileName}`;

    // Convert File to ArrayBuffer for Supabase storage
    const arrayBuffer = await file.arrayBuffer();

    // Upload the new logo
    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(`Failed to upload logo: ${uploadError.message}`);
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from("logos")
      .getPublicUrl(filePath);

    // Update shop settings with new logo URL
    const { data, error: updateError } = await supabase
      .from("shop_settings")
      .update({ shop_logo_url: publicUrlData.publicUrl })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      throw new Error(
        `Failed to update shop settings with new logo: ${updateError.message}`
      );
    }

    // Revalidate related paths
    revalidatePath("/admin/settings/shop");
    revalidatePath("/");

    return data;
  } catch (error) {
    console.error("Error in uploadLogoAction:", error);
    throw new Error(`Failed to upload logo: ${(error as Error).message}`);
  }
}
