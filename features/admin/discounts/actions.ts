"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema for validate create discount input
const createDiscountSchema = z.object({
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
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  max_uses: z.number().int().nullable().optional(),
  remaining_uses: z.number().int().nullable().optional(),
  min_order_value: z.number().nullable().optional(),
  max_discount_amount: z.number().nullable().optional(),
  discount_percentage: z.number().nullable().optional(),
  is_active: z.boolean().default(true),
});

// Schema for validate update discount input
const updateDiscountSchema = createDiscountSchema.extend({
  id: z.number().int().positive(),
});

// Types based on the schema
export type CreateDiscountInput = z.infer<typeof createDiscountSchema>;
export type UpdateDiscountInput = z.infer<typeof updateDiscountSchema>;

/**
 * Create a new discount
 */
export async function createDiscountAction(
  data: CreateDiscountInput
): Promise<{ success: boolean; error?: string; id?: number }> {
  try {
    // Validate input
    const validatedData = createDiscountSchema.parse(data);

    // Get server client
    const supabase = await getSupabaseServerClient();

    // Check if code is already used
    const { data: existingDiscount, error: checkError } = await supabase
      .from("discounts")
      .select("id")
      .eq("code", validatedData.code)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing discount:", checkError);
      return { success: false, error: checkError.message };
    }

    if (existingDiscount) {
      return {
        success: false,
        error: `Mã giảm giá '${validatedData.code}' đã tồn tại`,
      };
    }

    // Insert discount
    const { data: newDiscount, error } = await supabase
      .from("discounts")
      .insert(validatedData)
      .select("id")
      .single();

    if (error) {
      console.error("Error creating discount:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate discounts page
    revalidatePath("/admin/discounts");

    return {
      success: true,
      id: newDiscount.id,
    };
  } catch (error) {
    console.error("Error in createDiscountAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Update an existing discount
 */
export async function updateDiscountAction(
  data: UpdateDiscountInput
): Promise<{ success: boolean; error?: string; id?: number }> {
  try {
    // Validate input
    const validatedData = updateDiscountSchema.parse(data);
    const { id, ...updateData } = validatedData;

    // Get server client
    const supabase = await getSupabaseServerClient();

    // Update discount
    const { error } = await supabase
      .from("discounts")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Error updating discount:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate discounts page
    revalidatePath("/admin/discounts");

    return {
      success: true,
      id,
    };
  } catch (error) {
    console.error("Error in updateDiscountAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
