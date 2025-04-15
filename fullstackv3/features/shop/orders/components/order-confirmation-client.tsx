"use client";

import { useEffect } from "react";
import { useCheckout } from "@/features/shop/cart/providers/checkout-provider";

export function OrderConfirmationClient() {
  const { setJustPlacedOrder } = useCheckout();

  // Reset the justPlacedOrder flag when navigating to order confirmation page
  useEffect(() => {
    // Reset the flag after a short delay to ensure checkout navigation completes
    const timer = setTimeout(() => {
      setJustPlacedOrder(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [setJustPlacedOrder]);

  // This component doesn't render anything, it just manages state
  return null;
}
