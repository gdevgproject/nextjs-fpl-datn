"use client"

import { useCart as useCartContext } from "../contexts/CartContext"

export function useCart() {
  return useCartContext()
}

