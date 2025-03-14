"use client"

import type { CartItem } from "../types/cartTypes"
import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

type CartContextType = {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  isLoading: boolean
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  updateUnit: (id: string, unit: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        setItems(JSON.parse(savedCart))
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error)
    }
  }, [])

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(items))
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error)
    }
  }, [items])

  const totalItems = items.reduce((total, item) => total + item.quantity, 0)
  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0)

  const addItem = useCallback((item: CartItem) => {
    setIsLoading(true)
    try {
      const validItem = {
        ...item,
        quantity: Math.max(1, Math.floor(item.quantity) || 1),
      }

      setItems((prev) => {
        const existingItemIndex = prev.findIndex((i) => i.id === validItem.id)

        if (existingItemIndex >= 0) {
          const updatedItems = [...prev]
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + validItem.quantity,
          }
          return updatedItems
        }

        return [...prev, validItem]
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeItem = useCallback((id: string) => {
    setIsLoading(true)
    try {
      setItems((prev) => prev.filter((item) => item.id !== id))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setIsLoading(true)
    try {
      const validQuantity = Math.max(1, Math.floor(quantity) || 1)

      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: validQuantity } : item)))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateUnit = useCallback((id: string, unit: string) => {
    setIsLoading(true)
    try {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, unit } : item)))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearCart = useCallback(() => {
    setIsLoading(true)
    try {
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        isLoading,
        addItem,
        removeItem,
        updateQuantity,
        updateUnit,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

