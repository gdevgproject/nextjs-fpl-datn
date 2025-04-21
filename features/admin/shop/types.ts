import { z } from "zod";

// Zod schema for shop settings validation
export const shopSettingsSchema = z.object({
  shop_name: z.string().min(1, "Tên cửa hàng không được để trống"),
  contact_email: z.string().email("Email không hợp lệ").nullable().optional(),
  contact_phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  facebook_url: z
    .string()
    .url("URL Facebook không hợp lệ")
    .nullable()
    .optional(),
  messenger_url: z
    .string()
    .url("URL Messenger không hợp lệ")
    .nullable()
    .optional(),
  zalo_url: z.string().url("URL Zalo không hợp lệ").nullable().optional(),
  instagram_url: z
    .string()
    .url("URL Instagram không hợp lệ")
    .nullable()
    .optional(),
  tiktok_url: z.string().url("URL TikTok không hợp lệ").nullable().optional(),
  youtube_url: z.string().url("URL YouTube không hợp lệ").nullable().optional(),
  refund_policy_text: z.string().nullable().optional(),
  shipping_policy_text: z.string().nullable().optional(),
  privacy_policy_text: z.string().nullable().optional(),
  terms_conditions_text: z.string().nullable().optional(),
  default_shipping_fee: z.coerce
    .number()
    .min(0, "Phí vận chuyển không được âm"),
  order_confirmation_sender_email: z
    .string()
    .email("Email không hợp lệ")
    .nullable()
    .optional(),
});

export type ShopSettingsFormValues = z.infer<typeof shopSettingsSchema>;

export const logoSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 2 * 1024 * 1024, {
      message: "Logo không được vượt quá 2MB",
    })
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
          file.type
        ),
      {
        message: "Chỉ chấp nhận các định dạng JPG, PNG, GIF, hoặc WEBP",
      }
    ),
});

// Interface for the shop settings database model
export interface ShopSettings {
  id: number;
  shop_name: string;
  shop_logo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  facebook_url: string | null;
  messenger_url: string | null;
  zalo_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  refund_policy_text: string | null;
  shipping_policy_text: string | null;
  privacy_policy_text: string | null;
  terms_conditions_text: string | null;
  default_shipping_fee: number;
  order_confirmation_sender_email: string | null;
  created_at: string;
  updated_at: string;
}
