"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  LabelList,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PaymentMethodRevenue } from "../types";
import { formatPrice } from "@/lib/utils";
import { useTheme } from "next-themes";

interface PaymentMethodBarChartProps {
  data: PaymentMethodRevenue[];
}

// Custom tooltip component with dark mode support
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card p-3 border rounded-md shadow-md">
        <p className="font-medium text-card-foreground">{label}</p>
        <p className="text-sm font-semibold text-card-foreground">
          {formatPrice(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export function PaymentMethodBarChart({ data }: PaymentMethodBarChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Don't render if no data or empty data
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Doanh thu theo phương thức thanh toán</CardTitle>
          <CardDescription>
            Phân bổ doanh thu theo từng phương thức thanh toán trong kỳ
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">Không có dữ liệu</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate total revenue for percentages
  const totalRevenue = data.reduce((sum, item) => sum + item.value, 0);

  // Sort data by value in descending order for better visualization
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  // Add percentage to data and assign vibrant colors based on payment method name
  const paymentMethodColors: Record<string, { light: string; dark: string }> = {
    COD: { light: "#2563EB", dark: "#3B82F6" }, // Blue
    MoMo: { light: "#DB2777", dark: "#EC4899" }, // Pink
    VNPay: { light: "#059669", dark: "#10B981" }, // Green
    ZaloPay: { light: "#0891B2", dark: "#06B6D4" }, // Cyan
    "Chuyển khoản": { light: "#4F46E5", dark: "#6366F1" }, // Indigo
    "Ví điện tử": { light: "#7C3AED", dark: "#8B5CF6" }, // Violet
    "Thẻ tín dụng": { light: "#D97706", dark: "#F59E0B" }, // Amber
    "Thẻ ATM": { light: "#15803D", dark: "#22C55E" }, // Emerald
  };

  // Default color for unknown payment methods
  const defaultColors = { light: "#6B7280", dark: "#9CA3AF" }; // Gray

  const dataWithPercentage = sortedData.map((item) => ({
    ...item,
    percentage: totalRevenue > 0 ? (item.value / totalRevenue) * 100 : 0,
    color: paymentMethodColors[item.name]
      ? isDark
        ? paymentMethodColors[item.name].dark
        : paymentMethodColors[item.name].light
      : isDark
      ? defaultColors.dark
      : defaultColors.light,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Doanh thu theo phương thức thanh toán</CardTitle>
        <CardDescription>
          Phân bổ doanh thu theo từng phương thức thanh toán trong kỳ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dataWithPercentage}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 50,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-muted"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
                className="fill-foreground"
              />
              <YAxis
                tickFormatter={(value) => formatPrice(value)}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                width={80}
                className="fill-foreground"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => (
                  <span className="text-sm text-foreground">{value}</span>
                )}
              />
              <Bar
                dataKey="value"
                name="Doanh thu"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              >
                {dataWithPercentage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="percentage"
                  position="top"
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                  className="fill-foreground text-[11px]"
                  style={{ fontSize: "11px" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
