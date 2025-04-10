import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
})

export const registerSchema = z
  .object({
    email: z.string().email({ message: "Email không hợp lệ" }),
    password: z
      .string()
      .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
      .regex(/[a-z]/, { message: "Mật khẩu phải có ít nhất 1 chữ cái thường" })
      .regex(/[A-Z]/, { message: "Mật khẩu phải có ít nhất 1 chữ cái hoa" })
      .regex(/[0-9]/, { message: "Mật khẩu phải có ít nhất 1 chữ số" })
      .regex(/[^a-zA-Z0-9]/, { message: "Mật khẩu phải có ít nhất 1 ký tự đặc biệt" }),
    confirmPassword: z.string(),
    display_name: z.string().min(2, { message: "Tên hiển thị phải có ít nhất 2 ký tự" }),
    phone_number: z
      .string()
      .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, { message: "Số điện thoại không hợp lệ" })
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
      .regex(/[a-z]/, { message: "Mật khẩu phải có ít nhất 1 chữ cái thường" })
      .regex(/[A-Z]/, { message: "Mật khẩu phải có ít nhất 1 chữ cái hoa" })
      .regex(/[0-9]/, { message: "Mật khẩu phải có ít nhất 1 chữ số" })
      .regex(/[^a-zA-Z0-9]/, { message: "Mật khẩu phải có ít nhất 1 ký tự đặc biệt" }),
    confirmPassword: z.string(),
    currentPassword: z.string().optional(), // Thêm trường mật khẩu hiện tại (tùy chọn)
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })

