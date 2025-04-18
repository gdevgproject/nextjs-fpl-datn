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

/** Shipping address to persist or submit */
export interface ShippingAddress {
  recipientName: string;
  phoneNumber: string;
  provinceCity: string;
  district: string;
  ward: string;
  streetAddress: string;
  postalCode?: string;
}

/** Guest checkout information */
export interface GuestCheckoutInfo {
  name: string;
  email: string;
  phone: string;
}

/** Parameters to place an order */
export interface PlaceOrderParams {
  shippingAddress: ShippingAddress;
  paymentMethodId: number;
  deliveryNotes?: string;
  discountId?: number;
  cartItems: CartItem[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  guestInfo?: GuestCheckoutInfo | null;
}

/** Response from place order action */
export interface PlaceOrderResponse {
  success: boolean;
  orderId?: number;
  accessToken?: string;
  error?: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

/** Form data collected during checkout */
export interface CheckoutFormData {
  fullName: string;
  email?: string;
  phoneNumber: string;
  address: string;
  province: string;
  district: string;
  ward: string;
  deliveryNotes?: string;
  paymentMethodId: number;
}

/** Steps in checkout process */
export type CheckoutStep = "address" | "payment" | "review";
