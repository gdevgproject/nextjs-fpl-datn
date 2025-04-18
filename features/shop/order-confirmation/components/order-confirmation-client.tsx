"use client";

import { useEffect } from "react";
import { useCheckout } from "@/features/shop/checkout/checkout-provider";

export function OrderConfirmationClient() {
  const { setJustPlacedOrder } = useCheckout();

  // Reset the justPlacedOrder flag when navigating to order confirmation page
  useEffect(() => {
    // Reset the flag immediately - the delay isn't really necessary
    // and could cause issues with navigation
    setJustPlacedOrder(false);

    // No need for a cleanup function since this is a one-time operation
  }, [setJustPlacedOrder]);

  // This component doesn't render anything, it just manages state
  return null;
}
