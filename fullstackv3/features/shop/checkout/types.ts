export interface CartItem {
  id: string | number;
  variantId: number;
  quantity: number;
  product?: {
    id: number | string;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    volumeMl: number;
    images: any[];
  };
}

export interface Discount {
  id: number;
  code: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  maxUses?: number;
  remainingUses?: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  discountPercentage: number;
  isActive: boolean;
}

export interface ShippingAddress {
  recipientName: string;
  recipientPhone: string;
  provinceCity: string;
  district: string;
  ward: string;
  streetAddress: string;
  postalCode?: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface GuestCheckoutInfo {
  name: string;
  email: string;
  phone: string;
}

export interface OrderItemData {
  productVariantId: number;
  quantity: number;
  price: number;
}

export interface OrderData {
  customerInfo: ShippingAddress & { email: string; note?: string };
  paymentMethodId: number;
  shippingMethod: string;
  items: OrderItemData[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  discountCode?: string;
}

export interface OrderResponse {
  orderId?: number;
  error?: string;
}

export interface CheckoutState {
  cartItems: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  appliedDiscount: Discount | null;
  discountAmount: number;
  shippingFee: number;
  subtotal: number;
  total: number;
}

export type CheckoutStep =
  | "cart"
  | "shipping"
  | "payment"
  | "review"
  | "confirmation";
