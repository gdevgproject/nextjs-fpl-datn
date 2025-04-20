import { z } from "zod";

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

export type ShopSettings = {
  id: number;
  shop_logo_url: string | null;
} & z.infer<typeof shopSettingsSchema>;

export type ShopSettingsFormValues = z.infer<typeof shopSettingsSchema>;
