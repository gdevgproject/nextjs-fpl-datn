"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";

interface CartContextType {
  itemCount: number;
  setItemCount: React.Dispatch<React.SetStateAction<number>>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [itemCount, setItemCount] = useState(0);

  // Persist cart item count in local storage
  useEffect(() => {
    const storedItemCount = localStorage.getItem("cartItemCount");
    if (storedItemCount) {
      setItemCount(Number.parseInt(storedItemCount));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cartItemCount", itemCount.toString());
  }, [itemCount]);

  const value: CartContextType = {
    itemCount,
    setItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside a CartProvider");
  }
  return context;
}
