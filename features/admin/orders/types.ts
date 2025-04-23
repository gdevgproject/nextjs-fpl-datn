import { Database } from "@/lib/types/database.types";
import { z } from "zod";

// Base types from database
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type OrderStatus = Database["public"]["Tables"]["order_statuses"]["Row"];
export type PaymentMethod =
  Database["public"]["Tables"]["payment_methods"]["Row"];

// Extended types with joins
export type OrderWithRelations = Order & {
  order_statuses: Pick<OrderStatus, "id" | "name">;
  payment_methods: Pick<PaymentMethod, "id" | "name">;
  profiles?: {
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
    products: {
      id: number;
      slug: string;
    };
  } | null;
};

// Filter and pagination types
export interface OrdersFilters {
  search?: string;
  status?: number | null;
  paymentStatus?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  assignedShipperId?: string | null;
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
}

// Schema for order status update
export const orderStatusUpdateSchema = z.object({
  id: z.number(),
  order_status_id: z.number(),
});

// Schema for assigning shipper
export const assignShipperSchema = z.object({
  id: z.number(),
  assigned_shipper_id: z.string().nullable(),
});

// Schema for order cancellation
export const cancelOrderSchema = z.object({
  id: z.number(),
  reason: z.string().min(1, "Reason is required"),
});

// Response types
export interface OrdersResponse {
  data: OrderWithRelations[];
  count: number | null;
}

export interface OrderDetailsResponse {
  data: OrderWithRelations | null;
  count: number | null;
}

export interface OrderItemsResponse {
  data: OrderItemWithRelations[];
  count: number | null;
}

// Payment status types
export type PaymentStatus = "Pending" | "Paid" | "Failed";
