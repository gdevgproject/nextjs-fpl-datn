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

interface PaymentMethodBarChartProps {
  data: PaymentMethodRevenue[];
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-3 border rounded-md shadow-md">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-sm font-semibold">{formatPrice(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export function PaymentMethodBarChart({ data }: PaymentMethodBarChartProps) {
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

  // Add percentage to data
  const dataWithPercentage = sortedData.map((item) => ({
    ...item,
    percentage: totalRevenue > 0 ? (item.value / totalRevenue) * 100 : 0,
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tickFormatter={(value) => formatPrice(value)}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span className="text-sm">{value}</span>}
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
                  style={{ fontSize: "11px", fill: "#6B7280" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
