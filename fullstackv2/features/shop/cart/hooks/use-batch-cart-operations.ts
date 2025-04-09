"use client"

import { useCallback } from "react"
import { useClientBatchMutation } from "@/shared/hooks/use-client-batch-mutation"
import { useCart } from "../context/cart-context"
import { createClient } from "@/shared/supabase/client"
import { useAuth } from "@/features/auth/context/auth-context"
import { toast } from "sonner"

const supabase = createClient()

interface CartBatchOperation {
  batchAddItems: (items: Array<{ variant_id: number; quantity: number }>) => Promise<void>
  batchRemoveItems: (cartItemIds: number[]) => Promise<void>
  batchUpdateItems: (items: Array<{ id: number; quantity: number }>) => Promise<void>
}

export function useBatchCartOperations(): CartBatchOperation {
  const { user } = useAuth()
  const { refetchCart } = useCart()
  const isAuthenticated = !!user

  // Batch mutation for cart items
  const batchMutation = useClientBatchMutation("cart_items", {
    primaryKey: "id",
    invalidateQueries: [["cart", user?.id]],
  })

  // Batch add items to cart
  const batchAddItems = useCallback(
    async (items: Array<{ variant_id: number; quantity: number }>) => {
      if (!isAuthenticated || items.length === 0) return

      try {
        // Get user's cart ID
        const { data: cartData, error: cartError } = await supabase
          .from("shopping_carts")
          .select("id")
          .eq("user_id", user.id)
          .single()

        if (cartError) throw new Error(`Failed to fetch cart: ${cartError.message}`)

        // Prepare items for insertion
        const cartItems = items.map((item) => ({
          cart_id: cartData.id,
          variant_id: item.variant_id,
          quantity: item.quantity,
        }))

        // Use batch mutation to insert items
        await batchMutation.mutateAsync({
          action: "insert",
          items: cartItems,
        })

        // Refetch cart to update UI
        await refetchCart()

        toast.success("Sản phẩm đã được thêm vào giỏ hàng")
      } catch (error) {
        toast.error(`Thêm sản phẩm thất bại: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    },
    [isAuthenticated, user, batchMutation, refetchCart],
  )

  // Batch remove items from cart
  const batchRemoveItems = useCallback(
    async (cartItemIds: number[]) => {
      if (!isAuthenticated || cartItemIds.length === 0) return

      try {
        // Use batch mutation to delete items
        await Promise.all(
          cartItemIds.map((id) =>
            batchMutation.mutateAsync({
              action: "delete",
              items: [{ id }],
            }),
          ),
        )

        // Refetch cart to update UI
        await refetchCart()

        toast.success("Sản phẩm đã được xóa khỏi giỏ hàng")
      } catch (error) {
        toast.error(`Xóa sản phẩm thất bại: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    },
    [isAuthenticated, batchMutation, refetchCart],
  )

  // Batch update items in cart
  const batchUpdateItems = useCallback(
    async (items: Array<{ id: number; quantity: number }>) => {
      if (!isAuthenticated || items.length === 0) return

      try {
        // Use batch mutation to update items
        await Promise.all(
          items.map((item) =>
            batchMutation.mutateAsync({
              action: "update",
              items: [item],
            }),
          ),
        )

        // Refetch cart to update UI
        await refetchCart()
      } catch (error) {
        toast.error(`Cập nhật giỏ hàng thất bại: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    },
    [isAuthenticated, batchMutation, refetchCart],
  )

  return {
    batchAddItems,
    batchRemoveItems,
    batchUpdateItems,
  }
}
