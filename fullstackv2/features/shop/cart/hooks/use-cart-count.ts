"use client"

import { useClientFetch } from "@/shared/hooks/use-client-fetch"
import { useAuth } from "@/features/auth/context/auth-context"

export function useCartCount() {
  const { user } = useAuth()

  // Use the existing useClientFetch hook to get cart items
  const { data, isLoading } = useClientFetch(["cart", "count", user?.id], "cart_items", {
    filters: (query) => {
      // Join with shopping_carts to get the user's cart
      return query
        .select("id")
        .eq("cart_id", query.in("id", query.from("shopping_carts").select("id").eq("user_id", user?.id)))
    },
    // Only run this query if user is logged in
    enabled: !!user,
  })

  // Return the count of items in the cart
  return {
    count: data?.length || 0,
    isLoading,
  }
}
