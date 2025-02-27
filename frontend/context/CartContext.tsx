"use client";

import { createContext, useContext, useReducer } from "react";
import type { Cart, CartItem, Product } from "@/lib/types";

type CartAction =
  | {
      type: "ADD_ITEM";
      payload: { product: Product; quantity: number; volume: number };
    }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "APPLY_DISCOUNT"; payload: string }
  | { type: "CLEAR_CART" };

const CartContext = createContext<{
  cart: Cart;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

function cartReducer(state: Cart, action: CartAction): Cart {
  switch (action.type) {
    case "ADD_ITEM": {
      const { product, quantity, volume } = action.payload;
      const existingItem = state.items.find(
        (item) => item.product.id === product.id && item.volume === volume
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === existingItem.id
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  totalPrice: (item.quantity + quantity) * product.price,
                }
              : item
          ),
          totalQuantity: state.totalQuantity + quantity,
          totalAmount: state.totalAmount + quantity * product.price,
        };
      }

      const newItem: CartItem = {
        id: `${product.id}-${volume}`,
        product,
        quantity,
        volume,
        totalPrice: quantity * product.price,
      };

      return {
        ...state,
        items: [...state.items, newItem],
        totalQuantity: state.totalQuantity + quantity,
        totalAmount: state.totalAmount + newItem.totalPrice,
      };
    }

    case "REMOVE_ITEM": {
      const item = state.items.find((item) => item.id === action.payload);
      if (!item) return state;

      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
        totalQuantity: state.totalQuantity - item.quantity,
        totalAmount: state.totalAmount - item.totalPrice,
      };
    }

    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload;
      const item = state.items.find((item) => item.id === id);
      if (!item) return state;

      const quantityDiff = quantity - item.quantity;
      const priceDiff = quantityDiff * item.product.price;

      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity,
                totalPrice: quantity * item.product.price,
              }
            : item
        ),
        totalQuantity: state.totalQuantity + quantityDiff,
        totalAmount: state.totalAmount + priceDiff,
      };
    }

    case "CLEAR_CART":
      return {
        items: [],
        totalQuantity: 0,
        totalAmount: 0,
      };

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, {
    items: [],
    totalQuantity: 0,
    totalAmount: 0,
  });

  return (
    <CartContext.Provider value={{ cart, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
