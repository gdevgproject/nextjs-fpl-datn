import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/types";

export function useCartActions() {
  const { dispatch } = useCart();

  const addToCart = (product: Product, quantity: number, volume: number) => {
    dispatch({
      type: "ADD_ITEM",
      payload: { product, quantity, volume },
    });
  };

  const removeFromCart = (itemId: string) => {
    dispatch({
      type: "REMOVE_ITEM",
      payload: itemId,
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { id: itemId, quantity },
    });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  return {
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
}
