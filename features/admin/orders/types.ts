import { Database } from "@/lib/types/database.types";
import { z } from "zod";

// Base types from database
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type OrderStatus = Database["public"]["Tables"]["order_statuses"]["Row"];
export type PaymentMethod =
  Database["public"]["Tables"]["payment_methods"]["Row"];

// Enhanced types with relations according to the schema
export type OrderWithRelations = Order & {
  order_statuses: Pick<OrderStatus, "id" | "name" | "color" | "description">;
  payment_methods: Pick<
    PaymentMethod,
    "id" | "name" | "description" | "is_online"
  >;
  profiles?: {
    id: string;
    display_name: string | null;
    phone_number: string | null;
    avatar_url: string | null;
    email: string | null;
  } | null;
  order_items?: OrderItemWithRelations[];
  shipper_profile?: {
    id: string;
    display_name: string | null;
    phone_number: string | null;
    avatar_url: string | null;
  } | null;
};

export type OrderItemWithRelations = OrderItem & {
  product_variants: {
    id: number;
    product_id: number;
    sku: string;
    volume: number;
    price: number;
    sale_price: number | null;
    products: {
      id: number;
      name: string;
      slug: string;
      brand_id: number;
      brands?: {
        id: number;
        name: string;
      } | null;
    };
    product_images?: {
      id: number;
      url: string;
      is_main: boolean;
    }[];
  } | null;
};

// Filter and pagination types - enhanced based on the schema
export interface OrdersFilters {
  search?: string;
  status_id?: number | null;
  payment_status?: string | null;
  payment_method_id?: number | null;
  date_start?: string | null;
  date_end?: string | null;
  assigned_shipper_id?: string | null;
  has_delivery_issues?: boolean | null;
  cancelled_order?: boolean | null;
  user_id?: string | null;
}

export interface OrdersPagination {
  page: number;
  pageSize: number;
}

export interface OrdersSort {
  column: string;
  direction: "asc" | "desc";
}

// Shipper type
export interface Shipper {
  id: string;
  email: string;
  name: string;
  phone_number?: string;
  avatar_url?: string;
  last_active?: string | null;
}

// Schema for order status update
export const orderStatusUpdateSchema = z.object({
  id: z.number(),
  order_status_id: z.number(),
  internal_note: z.string().optional(),
});

// Schema for assigning shipper
export const assignShipperSchema = z.object({
  id: z.number(),
  assigned_shipper_id: z.string().nullable(),
  internal_note: z.string().optional(),
});

// Schema for recording delivery issues
export const recordDeliveryIssueSchema = z.object({
  id: z.number(),
  delivery_failure_reason: z.string().min(1, "Reason is required"),
  reschedule_date: z.date().optional(),
  attempt_delivery_again: z.boolean().default(true),
});

// Schema for order cancellation
export const cancelOrderSchema = z.object({
  id: z.number(),
  cancellation_reason: z.string().min(1, "Reason is required"),
  refund_amount: z.number().optional(),
  internal_note: z.string().optional(),
});

// Schema for adding order comment/note
export const orderNoteSchema = z.object({
  order_id: z.number(),
  note: z.string().min(1, "Note is required"),
  is_internal: z.boolean().default(true),
});

// Payment confirmation schema
export const confirmPaymentSchema = z.object({
  id: z.number(),
  transaction_details: z.object({
    transaction_id: z.string().optional(),
    amount: z.number(),
    transaction_date: z.string().optional(),
    payment_method: z.string(),
    notes: z.string().optional(),
  }),
});

// Response types
export interface OrdersResponse {
  data: OrderWithRelations[];
  count: number | null;
}

export interface OrderDetailsResponse {
  data: OrderWithRelations | null;
  items: OrderItemWithRelations[];
  history: OrderStatusHistory[];
  notes: OrderNote[];
}

export interface OrderItemsResponse {
  data: OrderItemWithRelations[];
  count: number | null;
}

// Enhanced Order status history type
export interface OrderStatusHistory {
  id: number;
  order_id: number;
  previous_status_id: number | null;
  new_status_id: number;
  changed_by_user_id: string;
  changed_at: string;
  note: string | null;
  status_name: string;
  user_name: string | null;
}

// Order notes type
export interface OrderNote {
  id: number;
  order_id: number;
  user_id: string;
  note: string;
  created_at: string;
  updated_at: string;
  is_internal: boolean;
  user_name: string | null;
}

// Payment status types
export type PaymentStatus =
  | "Pending"
  | "Paid"
  | "Failed"
  | "Refunded"
  | "Partially Refunded";

// Order summary stats
export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipping: number;
  delivered: number;
  completed: number;
  cancelled: number;
  revenue: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
}
