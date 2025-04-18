"use client";
import { useEffect } from "react";
import { useAuthQuery } from "@/features/auth/hooks";
import { getGuestCart, clearGuestCart } from "../guest-cart";
import { mergeGuestCartAction } from "../cart-actions";
import { useQueryClient } from "@tanstack/react-query";

export function CartMergeOnLogin() {
  const { data: session } = useAuthQuery();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (session?.user) {
      const guestItems = getGuestCart();
      if (guestItems.length > 0) {
        mergeGuestCartAction(guestItems, session.user.id).then(() => {
          clearGuestCart();
          queryClient.invalidateQueries(["cart", true]);
        });
      }
    }
  }, [session?.user, queryClient]);

  return null;
}
