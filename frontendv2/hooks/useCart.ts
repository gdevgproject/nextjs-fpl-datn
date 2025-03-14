"use client"

import { useCart as useCartFromFeature } from "@/features/cart/hooks/useCart"

export function useCart() {
  return useCartFromFeature()
}

