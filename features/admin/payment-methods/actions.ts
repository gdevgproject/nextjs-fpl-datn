"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { paymentMethodSchema, type PaymentMethod } from "./types";
import { revalidatePath } from "next/cache";

/**
 * Create a new payment method
 */
export async function createPaymentMethodAction(data: PaymentMethod) {
  // Validate input data with Zod schema
  const validatedData = paymentMethodSchema.parse(data);

  // Get Supabase client
  const supabase = await getSupabaseServerClient();

  // Insert into database
  const { data: paymentMethod, error } = await supabase
    .from("payment_methods")
    .insert([validatedData])
    .select()
    .single();

  // Handle error
  if (error) {
    console.error("Error creating payment method:", error);
    throw new Error(`Không thể tạo phương thức thanh toán: ${error.message}`);
  }

  // Revalidate related paths
  revalidatePath("/admin/payment-methods");

  return paymentMethod;
}

/**
 * Update an existing payment method
 */
export async function updatePaymentMethodAction(data: PaymentMethod) {
  // Ensure ID is present
  if (!data.id) {
    throw new Error("ID phương thức thanh toán không được để trống");
  }

  // Validate input data with Zod schema
  const validatedData = paymentMethodSchema.parse(data);

  // Extract ID for the query
  const { id, ...updateData } = validatedData;

  // Get Supabase client
  const supabase = await getSupabaseServerClient();

  // Update in database
  const { data: paymentMethod, error } = await supabase
    .from("payment_methods")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  // Handle error
  if (error) {
    console.error("Error updating payment method:", error);
    throw new Error(
      `Không thể cập nhật phương thức thanh toán: ${error.message}`
    );
  }

  // Revalidate related paths
  revalidatePath("/admin/payment-methods");

  return paymentMethod;
}

/**
 * Toggle payment method active state
 */
export async function togglePaymentMethodActiveStateAction(
  id: number,
  isActive: boolean
) {
  // Get Supabase client
  const supabase = await getSupabaseServerClient();

  // Update active state in database
  const { data: paymentMethod, error } = await supabase
    .from("payment_methods")
    .update({ is_active: isActive })
    .eq("id", id)
    .select()
    .single();

  // Handle error
  if (error) {
    console.error("Error updating payment method status:", error);
    throw new Error(
      `Không thể cập nhật trạng thái phương thức thanh toán: ${error.message}`
    );
  }

  // Revalidate related paths
  revalidatePath("/admin/payment-methods");

  return paymentMethod;
}
