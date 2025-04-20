"use server";
import { revalidatePath } from "next/cache";
import { shopSettingsSchema, ShopSettingsFormValues } from "./types";
import {
  updateAdminShopSettings,
  uploadShopLogo,
  deleteShopLogo,
} from "./services";

/**
 * Server action: validate, update, revalidate cache
 */
export async function updateShopSettingsAction(input: {
  id: number;
  values: ShopSettingsFormValues;
}) {
  // Validate bằng Zod
  const parsed = shopSettingsSchema.safeParse(input.values);
  if (!parsed.success) {
    return { error: "Dữ liệu không hợp lệ", issues: parsed.error.issues };
  }
  try {
    const data = await updateAdminShopSettings(input.id, parsed.data);
    revalidatePath("/admin/settings/shop");
    return { data };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Server action: upload logo, revalidate cache
 */
export async function uploadLogoAction(input: {
  file: File;
  id: number;
  oldLogoUrl: string | null;
}) {
  try {
    const data = await uploadShopLogo(input);
    revalidatePath("/admin/settings/shop");
    return { data };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Server action: delete logo, revalidate cache
 */
export async function deleteLogoAction(input: { id: number; logoUrl: string }) {
  try {
    const data = await deleteShopLogo(input);
    revalidatePath("/admin/settings/shop");
    return { data };
  } catch (error: any) {
    return { error: error.message };
  }
}
