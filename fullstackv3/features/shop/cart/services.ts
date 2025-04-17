// New file: services.ts
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  addToCart as addToCartAction,
  updateCartItemQuantity as updateCartItemAction,
  removeCartItem as removeCartItemAction,
  clearCart as clearCartAction,
} from "./cart-actions";

// Fetch current user's cart via API route
export async function fetchCartItems() {
  const res = await fetch("/api/cart", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch cart");
  const data = await res.json();
  return data.items;
}

// Mutation wrappers calling server actions
export async function addToCart(variantId: number, quantity: number) {
  const result = await addToCartAction(variantId, quantity);
  if (result.error) throw new Error(result.error);
  return variantId;
}

export async function updateCartItem(itemId: string, quantity: number) {
  const result = await updateCartItemAction(itemId, quantity);
  if (result.error) throw new Error(result.error);
  return { itemId, quantity };
}

export async function removeCartItem(itemId: string) {
  const result = await removeCartItemAction(itemId);
  if (result.error) throw new Error(result.error);
  return itemId;
}

export async function clearCart() {
  const result = await clearCartAction();
  if (result.error) throw new Error(result.error);
  return true;
}
