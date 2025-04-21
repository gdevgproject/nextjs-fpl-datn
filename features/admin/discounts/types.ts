import { z } from "zod";

// Base discount interface matching the database schema
export interface Discount {
  id: number;
  code: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  max_uses: number | null;
  remaining_uses: number | null;
  min_order_value: number | null;
  max_discount_amount: number | null;
  discount_percentage: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Define the possible discount status filters
export type DiscountFilter =
  | "all"
  | "active"
  | "inactive"
  | "expired"
  | "upcoming";

// Form schema for discount creation and editing
export const discountFormSchema = z
  .object({
    code: z
      .string()
      .min(1, "Mã giảm giá không được để trống")
      .max(50, "Mã giảm giá không được vượt quá 50 ký tự")
      .refine((value) => /^[A-Z0-9_-]+$/.test(value), {
        message:
          "Mã giảm giá chỉ được chứa chữ cái in hoa, số, gạch ngang và gạch dưới",
      }),
    description: z
      .string()
      .max(500, "Mô tả không được vượt quá 500 ký tự")
      .nullable()
      .optional(),
    is_active: z.boolean().default(true),
    discount_type: z.enum(["percentage", "fixed"]),
    discount_percentage: z
      .number()
      .min(0.01, "Phần trăm giảm giá phải lớn hơn 0")
      .max(100, "Phần trăm giảm giá không được vượt quá 100%")
      .nullable()
      .optional(),
    max_discount_amount: z
      .number()
      .min(0, "Số tiền giảm tối đa không được âm")
      .nullable()
      .optional(),
    min_order_value: z
      .number()
      .min(0, "Giá trị đơn hàng tối thiểu không được âm")
      .nullable()
      .optional(),
    max_uses: z
      .number()
      .int()
      .min(0, "Số lượt sử dụng tối đa không được âm")
      .nullable()
      .optional(),
    remaining_uses: z
      .number()
      .int()
      .min(0, "Số lượt sử dụng còn lại không được âm")
      .nullable()
      .optional(),
    start_date: z.date().nullable().optional(),
    end_date: z.date().nullable().optional(),
  })
  .refine(
    (data) => {
      // If discount_type is percentage, discount_percentage is required
      if (data.discount_type === "percentage" && !data.discount_percentage) {
        return false;
      }
      // If discount_type is fixed, max_discount_amount is required
      if (data.discount_type === "fixed" && !data.max_discount_amount) {
        return false;
      }
      return true;
    },
    {
      message: "Vui lòng nhập giá trị giảm giá phù hợp với loại giảm giá",
      path: ["discount_percentage"],
    }
  )
  .refine(
    (data) => {
      // If start_date and end_date are both provided, end_date must be after start_date
      if (data.start_date && data.end_date && data.end_date < data.start_date) {
        return false;
      }
      return true;
    },
    {
      message: "Ngày kết thúc phải sau ngày bắt đầu",
      path: ["end_date"],
    }
  )
  .refine(
    (data) => {
      // If max_uses is provided, remaining_uses can't be greater than max_uses
      if (
        data.max_uses !== null &&
        data.max_uses !== undefined &&
        data.remaining_uses !== null &&
        data.remaining_uses !== undefined &&
        data.remaining_uses > data.max_uses
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        "Số lượt sử dụng còn lại không được lớn hơn tổng số lượt sử dụng",
      path: ["remaining_uses"],
    }
  );

// Form values type derived from the schema
export type DiscountFormValues = z.infer<typeof discountFormSchema>;
