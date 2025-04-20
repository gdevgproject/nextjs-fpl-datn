import { z } from "zod";

/**
 * Payment method schema for validation
 */
export const paymentMethodSchema = z.object({
  id: z.number().optional(),
  name: z
    .string()
    .min(1, "Tên phương thức thanh toán không được để trống")
    .max(100, "Tên phương thức thanh toán không được vượt quá 100 ký tự"),
  description: z
    .string()
    .max(500, "Mô tả không được vượt quá 500 ký tự")
    .nullable()
    .optional(),
  is_active: z.boolean().default(true),
});

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

/**
 * Types for payment methods filtering, pagination, and sorting
 */
export interface PaymentMethodsFilters {
  search?: string;
}

export interface PaymentMethodsPagination {
  page: number;
  pageSize: number;
}

export interface PaymentMethodsSort {
  column: string;
  direction: "asc" | "desc";
}

/**
 * Type for payment methods query result
 */
export interface PaymentMethodsResult {
  data: PaymentMethod[];
  count: number | null;
}
