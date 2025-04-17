export type {
  CartItem,
  Discount,
  GuestCheckoutInfo,
  OrderData,
  OrderResponse,
} from "../checkout/types";

// Cart state type
export interface CartState {
  cartItems: CartItem[];
  cartItemCount: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  cartTotal: number;
  discountCode?: string;
  appliedDiscount: Discount | null;
  isUpdatingCart?: boolean;
  isLoading?: boolean;
}
