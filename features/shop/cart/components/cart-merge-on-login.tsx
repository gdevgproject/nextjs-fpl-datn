"use client";
import { useEffect, useRef } from "react";
import { useAuthQuery } from "@/features/auth/hooks";
import { getGuestCart, clearGuestCart } from "../guest-cart";
import { mergeGuestCartAction } from "../cart-actions";
import { useQueryClient } from "@tanstack/react-query";

export function CartMergeOnLogin() {
  const { data: session, isLoading: isSessionLoading } = useAuthQuery();
  const queryClient = useQueryClient();
  const mergeProcessedRef = useRef(false);

  useEffect(() => {
    // Only run this once per session change and only when session is loaded
    if (session?.user && !mergeProcessedRef.current && !isSessionLoading) {
      const guestItems = getGuestCart();
      if (guestItems.length > 0) {
        // Get current cached cart data before merge
        const currentCartData = queryClient.getQueryData(["cart", true]) || [];

        // Optimistically update cache with merged items to avoid flashing empty cart
        const mergedItems = [...currentCartData];
        guestItems.forEach((guestItem) => {
          const existingItemIndex = mergedItems.findIndex(
            (item) => item.variant_id === guestItem.variant_id
          );

          if (existingItemIndex >= 0) {
            // Update quantity for existing items
            mergedItems[existingItemIndex].quantity += guestItem.quantity;
          } else {
            // Add new items
            mergedItems.push(guestItem);
          }
        });

        // Update the cache immediately
        queryClient.setQueryData(["cart", true], mergedItems);

        // Then perform the actual merge operation
        mergeGuestCartAction(guestItems, session.user.id).then(() => {
          clearGuestCart();
          queryClient.invalidateQueries({ queryKey: ["cart", true] });
          mergeProcessedRef.current = true;
        });
      } else {
        mergeProcessedRef.current = true;
      }
    }

    // Reset processed flag when session changes
    if (!session) {
      mergeProcessedRef.current = false;
    }
  }, [session?.user, queryClient, isSessionLoading]);

  return null;
}
