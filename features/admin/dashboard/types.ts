// Dashboard metric types for the overview tab
export interface TimeFilter {
  startDate: Date;
  endDate: Date;
}

export type TimeFilterOption =
  | "today"
  | "thisWeek"
  | "thisMonth"
  | "thisYear"
  | "custom";

export interface DashboardOverviewMetrics {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  averageOrderValue: number;
  totalProductsSold: number;
  newCustomers: number;
}

// For use in date picker components
export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

// Dashboard metrics for Orders tab
export interface OrderStatusDistribution {
  name: string;
  count: number;
  color?: string;
}

export interface PaymentMethodRevenue {
  name: string;
  value: number;
  color?: string;
}

export interface RecentOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  statusColor?: string;
  paymentMethod?: string; // Add payment method field
}

export interface DashboardOrdersMetrics {
  ordersByStatus: OrderStatusDistribution[];
  pendingOrders: number;
  shippingOrders: number;
  cancelledOrders: number;
  cancellationRate: number;
  paymentMethodRevenue: PaymentMethodRevenue[];
  recentOrders: RecentOrder[];
}
