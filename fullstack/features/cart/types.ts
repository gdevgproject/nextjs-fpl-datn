import type { ProductVariant } from "../products/types";

/**
 * Shopping cart from the shopping_carts table
 */
export interface ShoppingCart {
  id: number;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  items?: CartItem[];
}

/**
 * Cart item from the cart_items table
 */
export interface CartItem {
  id: number;
  cart_id: number;
  variant_id: number;
  quantity: number;
  created_at?: string;
  updated_at?: string;
  // Expanded product variant data (optional, for frontend use)
  product?: {
    id: number;
    name: string;
    slug: string;
    price: number;
    sale_price: number | null;
    volume_ml: number;
    images: any[];
  };
}

/**
 * Cart context type
 */
export interface CartContextType {
  cartItems: CartItem[];
  cartItemCount: number;
  addToCart: (
    variantId: number,
    quantity: number,
    productId?: string
  ) => Promise<void>;
  updateCartQuantity: (variantId: number, quantity: number) => Promise<void>;
  removeFromCart: (variantId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal?: number;
  isLoading?: boolean;
}
