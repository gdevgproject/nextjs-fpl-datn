import { Product } from "./mockData";

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  volume: number; // Dung tích đã chọn
  totalPrice: number;
}

export interface Cart {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
  discountCode?: string;
  discountAmount?: number;
}
export type { Product };
