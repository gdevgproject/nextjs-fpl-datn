export interface CartItem {
  id: string
  name: string
  price: number
  originalPrice?: number // Make this optional to avoid the toLocaleString error
  quantity: number
  unit: string
  image?: string
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  totalItems: number
  totalPrice: number
}

export interface CartService {
  getCart(): Promise<Cart>
  addToCart(productId: string, quantity: number): Promise<Cart>
  removeFromCart(itemId: string): Promise<Cart>
  updateCartItem(itemId: string, quantity: number): Promise<Cart>
  clearCart(): Promise<Cart>
}

