"use client"

import { useState, useEffect } from "react"
import type { CartItem } from "../types/cartTypes"

// Mock data for demonstration
const mockCartItems: CartItem[] = [
  {
    id: "1",
    name: "Hộp Vitamin D3 King Phar bổ sung Canxi hỗ trợ xương chắc khỏe",
    price: 100000,
    originalPrice: 200000,
    quantity: 1,
    unit: "Hộp",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "2",
    name: "Hộp Vitamin D3 King Phar bổ sung Canxi hỗ trợ xương chắc khỏe",
    price: 100000,
    originalPrice: 200000,
    quantity: 1,
    unit: "Hộp",
    image: "/placeholder.svg?height=80&width=80",
  },
]

export function useCartDropdown() {
  // In a real app, you would use the cart context
  // const { items, removeItem } = useCart()
  const [items, setItems] = useState<CartItem[]>([])

  // Load mock data on client side
  useEffect(() => {
    setItems(mockCartItems)
  }, [])

  const totalItems = items.length

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  return {
    items,
    totalItems,
    handleRemoveItem,
  }
}

