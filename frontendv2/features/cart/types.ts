export interface CartItem {
  id: string
  name: string
  image: string
  price: number
  originalPrice?: number
  quantity: number
  unit: string
  discount?: number
}

export interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
}

