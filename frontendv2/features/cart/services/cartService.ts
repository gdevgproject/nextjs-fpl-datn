import axios from "axios"
import type { CartService, Cart } from "../types/cartTypes"

export class CartRealService implements CartService {
  async getCart(): Promise<Cart> {
    const response = await axios.get("/api/cart")
    return response.data
  }

  async addToCart(productId: string, quantity: number): Promise<Cart> {
    const response = await axios.post("/api/cart/items", { productId, quantity })
    return response.data
  }

  async removeFromCart(itemId: string): Promise<Cart> {
    const response = await axios.delete(`/api/cart/items/${itemId}`)
    return response.data
  }

  async updateCartItem(itemId: string, quantity: number): Promise<Cart> {
    const response = await axios.put(`/api/cart/items/${itemId}`, { quantity })
    return response.data
  }

  async clearCart(): Promise<Cart> {
    const response = await axios.delete("/api/cart")
    return response.data
  }
}

// Export a singleton instance
export const cartRealService = new CartRealService()

