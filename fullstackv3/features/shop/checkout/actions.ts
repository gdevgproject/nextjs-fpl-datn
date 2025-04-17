"use server";

import { securedPlaceOrder } from "./secure-place-order";
import type { PlaceOrderParams, PlaceOrderResponse } from "./types";
import { createServiceRoleClient } from "@/lib/supabase/serviceRoleClient";

/**
 * Server action to place an order safely via secure handling.
 * Wraps the lower-level securedPlaceOrder function.
 * @param params Parameters for placing an order
 * @returns PlaceOrderResponse with success flag and identifiers
 */
export async function placeOrderAction(
  params: PlaceOrderParams
): Promise<PlaceOrderResponse> {
  return securedPlaceOrder(params);
}

/**
 * Đánh dấu đơn hàng đã thanh toán thành công qua QR (demo Momo)
 */
export async function markOrderPaidAction(
  orderId: number,
  referenceId: string
) {
  const supabase = createServiceRoleClient();
  // Cập nhật bảng payments
  await supabase
    .from("payments")
    .update({
      status: "Completed",
      transaction_id: referenceId,
      updated_at: new Date().toISOString(),
    })
    .eq("order_id", orderId);
  // Cập nhật bảng orders
  await supabase
    .from("orders")
    .update({
      payment_status: "Paid",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);
  return { success: true };
}
