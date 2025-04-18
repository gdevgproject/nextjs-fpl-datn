// features/shop/cart/guest-cart.ts
// Helper functions for guest cart (localStorage)
import type { CartItem } from "./types";

const STORAGE_KEY = "guestCart";

export function getGuestCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function setGuestCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addGuestCartItem(item: CartItem) {
  const cart = getGuestCart();
  const idx = cart.findIndex((i) => i.variant_id === item.variant_id);
  if (idx >= 0) {
    cart[idx].quantity += item.quantity;
  } else {
    cart.push(item);
  }
  setGuestCart(cart);
}

export function updateGuestCartItemQuantity(
  variantId: number,
  quantity: number
) {
  const cart = getGuestCart();
  const idx = cart.findIndex((i) => i.variant_id === variantId);
  if (idx >= 0) {
    cart[idx].quantity = quantity;
    if (cart[idx].quantity <= 0) cart.splice(idx, 1);
    setGuestCart(cart);
  }
}

export function removeGuestCartItem(variantId: number) {
  const cart = getGuestCart().filter((i) => i.variant_id !== variantId);
  setGuestCart(cart);
}

export function clearGuestCart() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
