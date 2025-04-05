import type { ProductVariant } from "../products/types";

/**
 * Order filter
 */
export type OrderFilter = {
  status?: number;
  startDate?: Date;
  endDate?: Date;
  page?: number;
};

/**
 * Order from the orders table
 */
export interface Order {
  id: number;
  user_id: string | null;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  recipient_name: string;
  recipient_phone: string;
  province_city: string;
  district: string;
  ward: string;
  street_address: string;
  order_date: string;
  delivery_notes?: string;
  payment_method_id?: number;
  payment_status: "Pending" | "Paid" | "Failed" | "Refunded";
  order_status_id?: number;
  tracking_number?: string;
  discount_id?: number;
  subtotal_amount: number;
  discount_amount: number;
  shipping_fee: number;
  total_amount: number;
  created_at: string;
  updated_at: string;

  // Related entities
  items?: OrderItem[];
  order_status?: OrderStatus;
  payment_method?: PaymentMethod;
}

/**
 * Order item from the order_items table
 */
export interface OrderItem {
  id: number;
  order_id: number;
  variant_id: number;
  product_name: string;
  variant_volume_ml: number;
  quantity: number;
  unit_price_at_order: number;
  created_at: string;
  updated_at: string;

  // Related entities
  variant?: ProductVariant;
}

/**
 * Payment method from the payment_methods table
 */
export interface PaymentMethod {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
}

/**
 * Order status from the order_statuses table
 */
export interface OrderStatus {
  id: number;
  name: string;
}

/**
 * Payment entity
 */
export interface Payment {
  id: number;
  order_id: number;
  payment_date: string;
  payment_method_id?: number;
  transaction_id?: string;
  amount: number;
  status: "Pending" | "Completed" | "Failed" | "Refunded";
  payment_details?: any;
  created_at: string;
  updated_at: string;

  // Related entities
  payment_method?: PaymentMethod;
}

/**
 * Discount entity
 */
export interface Discount {
  id: number;
  code: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  max_uses?: number;
  remaining_uses?: number;
  min_order_value?: number;
  max_discount_amount?: number;
  discount_percentage?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
