"use server";

import { TimeFilterOption, DateRange } from "./types";
import {
  getDashboardOverviewMetrics,
  getDashboardOrdersMetrics,
  generateTimeFilter,
} from "./services";

export async function getOverviewMetricsAction(
  timeFilterOption: TimeFilterOption,
  customDateRange?: DateRange
) {
  try {
    // Convert the custom date range if provided and needed
    const customRange =
      timeFilterOption === "custom" &&
      customDateRange?.from &&
      customDateRange?.to
        ? { from: customDateRange.from, to: customDateRange.to }
        : undefined;

    // Generate appropriate time filter
    const timeFilter = generateTimeFilter(timeFilterOption, customRange);

    // Fetch the dashboard metrics
    const metrics = await getDashboardOverviewMetrics(timeFilter);

    return { success: true, data: metrics, timeFilter };
  } catch (error) {
    console.error("Error fetching overview metrics:", error);
    return {
      success: false,
      error: "Failed to fetch dashboard metrics",
      timeFilter: generateTimeFilter("thisMonth"), // Fallback
    };
  }
}

export async function getOrdersMetricsAction(
  timeFilterOption: TimeFilterOption,
  customDateRange?: DateRange
) {
  try {
    // Convert the custom date range if provided and needed
    const customRange =
      timeFilterOption === "custom" &&
      customDateRange?.from &&
      customDateRange?.to
        ? { from: customDateRange.from, to: customDateRange.to }
        : undefined;

    // Generate appropriate time filter
    const timeFilter = generateTimeFilter(timeFilterOption, customRange);

    // Fetch the orders dashboard metrics
    const metrics = await getDashboardOrdersMetrics(timeFilter);

    return {
      success: true,
      data: metrics,
      timeFilter,
    };
  } catch (error) {
    console.error("Error fetching orders metrics:", error);
    return {
      success: false,
      error: "Failed to fetch orders metrics",
      timeFilter: generateTimeFilter("thisMonth"), // Fallback
    };
  }
}
