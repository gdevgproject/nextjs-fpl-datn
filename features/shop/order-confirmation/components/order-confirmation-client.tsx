"use client";

import { useEffect } from "react";
import { useCheckout } from "@/features/shop/checkout/checkout-provider";
import { useSearchParams } from "next/navigation";
import { getOrderDetails } from "../actions";

export function OrderConfirmationClient() {
  const { setJustPlacedOrder, discountAmount, appliedDiscount } = useCheckout();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const token = searchParams.get("token");

  // Reset the justPlacedOrder flag when navigating to order confirmation page
  useEffect(() => {
    // Reset the flag immediately - the delay isn't really necessary
    // and could cause issues with navigation
    setJustPlacedOrder(false);

    // No need for a cleanup function since this is a one-time operation
  }, [setJustPlacedOrder]);

  // Debug information to trace discount values
  useEffect(() => {
    if (!orderId && !token) return;

    const identifier = orderId || token || "";

    // Log client-side information first
    console.log("CLIENT-SIDE VALUES (from checkout context):", {
      discountAmount,
      appliedDiscountId: appliedDiscount?.id,
      appliedDiscountCode: appliedDiscount?.code,
    });

    // Then fetch the actual order from database and compare
    const fetchOrder = async () => {
      try {
        const result = await getOrderDetails(identifier, !orderId);
        if (result.success && result.data) {
          console.log("SERVER-SIDE VALUES (from database):", {
            subtotal: result.data.subtotal,
            discount: result.data.discount,
            discount_code: result.data.discount_code,
            shipping_fee: result.data.shipping_fee,
            total: result.data.total,
            discount_id: result.data.discount_id,
            order_id: result.data.id,
          });

          // Check for discrepancies
          if (
            discountAmount > 0 &&
            (!result.data.discount || result.data.discount === 0)
          ) {
            console.error(
              "DISCOUNT DISCREPANCY DETECTED: Client shows discount but database doesn't"
            );
            console.error(
              "This suggests the database trigger might be overriding discount_amount"
            );
          }
        }
      } catch (error) {
        console.error("Error fetching order details for debugging:", error);
      }
    };

    fetchOrder();
  }, [orderId, token, discountAmount, appliedDiscount]);

  // This component doesn't render anything, it just manages state
  return null;
}
