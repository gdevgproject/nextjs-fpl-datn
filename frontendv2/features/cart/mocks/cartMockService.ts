import type { CartService, Cart, CartItem } from "../types/cartTypes"

// Mock cart data
let mockCart: Cart = {
  id: "cart-1",
  userId: "user-1",
  items: [
    {
      id: "item-1",
      productId: "1",
      name: "Viên uống NutriGrow Nutrimed bổ sung canxi, vitamin D3",
      price: 480000,
      quantity: 1,
      image: "/placeholder.svg",
    },
    {
      id: "item-2",
      productId: "2",
      name: "Viên uống Rama Bổ Phổi hỗ trợ bổ phổi, giảm ho hiệu quả",
      price: 155000,
      quantity: 2,
      image: "/placeholder.svg",
    },
  ],
  totalItems: 3,
  totalPrice: 790000,
}

// Helper function to recalculate cart totals
function recalculateCart(cart: Cart): Cart {
  cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0)
  cart.totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0)
  return cart
}

export class CartMockService implements CartService {
  async getCart(): Promise<Cart> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    return { ...mockCart }
  }

  async addToCart(productId: string, quantity: number): Promise<Cart> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Check if item already exists in cart
    const existingItemIndex = mockCart.items.findIndex((item) => item.productId === productId)

    if (existingItemIndex !== -1) {
      // Update existing item
      mockCart.items[existingItemIndex].quantity += quantity
    } else {
      // Add new item
      // In a real implementation, we would fetch product details from the product service
      const newItem: CartItem = {
        id: `item-${mockCart.items.length + 1}`,
        productId,
        name: `Product ${productId}`,
        price: 100000, // Mock price
        quantity,
        image: "/placeholder.svg",
      }

      mockCart.items.push(newItem)
    }

    // Recalculate cart totals
    mockCart = recalculateCart(mockCart)

    return { ...mockCart }
  }

  async removeFromCart(itemId: string): Promise<Cart> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Remove item from cart
    mockCart.items = mockCart.items.filter((item) => item.id !== itemId)

    // Recalculate cart totals
    mockCart = recalculateCart(mockCart)

    return { ...mockCart }
  }

  async updateCartItem(itemId: string, quantity: number): Promise<Cart> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Find item in cart
    const itemIndex = mockCart.items.findIndex((item) => item.id === itemId)

    if (itemIndex === -1) {
      throw new Error(`Item with id "${itemId}" not found in cart`)
    }

    // Update item quantity
    mockCart.items[itemIndex].quantity = quantity

    // Recalculate cart totals
    mockCart = recalculateCart(mockCart)

    return { ...mockCart }
  }

  async clearCart(): Promise<Cart> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Clear cart items
    mockCart.items = []

    // Recalculate cart totals
    mockCart = recalculateCart(mockCart)

    return { ...mockCart }
  }
}

// Export a singleton instance
export const cartMockService = new CartMockService()

