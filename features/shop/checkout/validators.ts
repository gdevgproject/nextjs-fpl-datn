import { z } from "zod";

// Chặt chẽ: Số điện thoại Việt Nam hợp lệ
export const phoneSchema = z.string().regex(/^((\+84)|0)(3|5|7|8|9)\d{8}$/, {
  message: "Số điện thoại không hợp lệ",
});

// Email (tùy chọn)
export const emailSchema = z.string().email("Email không hợp lệ").optional();

// Bước GuestInfo
export const guestInfoSchema = z.object({
  fullName: z.string().nonempty("Vui lòng nhập họ và tên"),
  email: emailSchema,
  phoneNumber: phoneSchema,
});

// Bước Address (user đã đăng nhập)
export const addressSchema = z.object({
  recipient_name: z.string().nonempty("Vui lòng nhập họ tên người nhận"),
  recipient_phone: phoneSchema,
  province_city: z.string().nonempty("Vui lòng nhập tỉnh/thành phố"),
  district: z.string().nonempty("Vui lòng nhập quận/huyện"),
  ward: z.string().nonempty("Vui lòng nhập phường/xã"),
  street_address: z.string().nonempty("Vui lòng nhập địa chỉ chi tiết"),
  postal_code: z.string().optional(),
  is_default: z.boolean(),
});
