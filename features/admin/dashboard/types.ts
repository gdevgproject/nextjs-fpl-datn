// Dashboard metric types for the overview tab
export interface TimeFilter {
  startDate: Date;
  endDate: Date;
}

export type TimeFilterOption =
  | "today"
  | "yesterday"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
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
  paymentMethod?: string;
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

// Dashboard metrics for Products & Inventory tab
export interface TopSellingProduct {
  id: number;
  name: string;
  brand: string;
  quantity: number;
  revenue: number;
  imageUrl?: string;
}

export interface LowStockProduct {
  id: number;
  name: string;
  variant: string;
  sku: string;
  stockQuantity: number;
  threshold?: number;
}

export interface NonMovingProduct {
  id: number;
  name: string;
  variant: string;
  sku: string;
  stockQuantity: number;
  lastOrderDate?: string;
  daysSinceLastOrder?: number;
}

export interface BrandRevenue {
  name: string;
  revenue: number;
  color?: string;
}

export interface WishlistedProduct {
  id: number;
  name: string;
  brand: string;
  count: number;
  inStock: boolean;
}

export interface DashboardProductsMetrics {
  topSellingByQuantity: TopSellingProduct[];
  topSellingByRevenue: TopSellingProduct[];
  lowStockProducts: LowStockProduct[];
  nonMovingProducts: NonMovingProduct[];
  brandRevenue: BrandRevenue[];
  mostWishlisted: WishlistedProduct[];
  totalInventoryValue: number;
  productCount: number;
  outOfStockCount: number;
  lowStockCount: number;
}
