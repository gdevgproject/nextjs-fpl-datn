"use client"

import { useCart } from "@/features/cart/hooks/useCart"
import { EmptyCart } from "@/features/cart/components/EmptyCart"
import { CartContent } from "@/features/cart/components/CartContent"

export default function CartPage() {
  const { items } = useCart()

  if (items.length === 0) {
    return <EmptyCart />
  }

  return <CartContent items={items} />
}

