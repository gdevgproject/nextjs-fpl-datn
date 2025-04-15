import type { PaymentStatus } from "@/features/shop/orders/types";

/**
 * Order filter parameters for listing orders
 */
export interface OrderFilter {
  page?: number;
  pageSize?: number;
  orderStatusId?: number;
  paymentStatus?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: "orderDate" | "totalAmount" | "customerName" | "id";
  sortOrder?: "asc" | "desc";
}

/**
 * Paginated orders response
 */
export interface PaginatedOrders {
  orders: OrderSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Summary of order for listing
 */
export interface OrderSummary {
  id: number;
  customerName: string;
  orderDate: string;
  totalAmount: number;
  orderStatusId: number;
  orderStatusName: string;
  paymentStatus: PaymentStatus;
  trackingNumber: string | null;
  itemCount: number;
}

/**
 * Detailed order information
 */
export interface OrderDetails {
  id: number;
  orderId: number;
  createdAt: string;
  updatedAt: string;
  orderDate: string;
  userId: string | null;
  isGuest: boolean;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;

  // Shipping info
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  provinceCity: string;
  district: string;
  ward: string;
  streetAddress: string;
  deliveryNotes: string | null;
  trackingNumber: string | null;

  // Payment info
  paymentMethodId: number | null;
  paymentMethodName: string | null;
  paymentStatus: PaymentStatus;

  // Order status
  orderStatusId: number;
  orderStatusName: string;

  // Financial details
  subtotalAmount: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;

  // Related entities
  items: OrderItemDetail[];
  payments: PaymentDetail[];
}

/**
 * Order item details
 */
export interface OrderItemDetail {
  id: number;
  productName: string;
  variantId: number;
  variantVolumeMl: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productImage: string | null;
}

/**
 * Payment details
 */
export interface PaymentDetail {
  id: number;
  paymentDate: string;
  paymentMethodId: number | null;
  paymentMethodName: string | null;
  transactionId: string | null;
  amount: number;
  status: PaymentStatus;
  paymentDetails: any | null;
}

/**
 * Order activity log entry
 */
export interface OrderActivityLog {
  id: number;
  adminUserId: string;
  adminUserName: string;
  activityType: string;
  description: string;
  timestamp: string;
  details: any;
}

/**
 * Order statistics
 */
export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  revenue: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}
