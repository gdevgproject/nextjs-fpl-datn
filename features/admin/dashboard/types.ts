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