"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Sector,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { OrderStatusDistribution } from "../types";
import { useState } from "react";

interface OrderStatusPieChartProps {
  data: OrderStatusDistribution[];
}

// Custom active shape for better interactivity
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 4}
        outerRadius={innerRadius - 1}
        fill={fill}
      />
    </g>
  );
};

// Custom tooltip with dark mode support
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const totalOrders = payload[0].payload.totalCount || 0;
    const percent =
      totalOrders > 0
        ? ((payload[0].value / totalOrders) * 100).toFixed(1)
        : "0.0";

    return (
      <div className="bg-card p-3 border rounded-md shadow-md">
        <p className="font-medium text-card-foreground">{payload[0].name}</p>
        <p className="text-sm text-card-foreground">
          <span className="font-medium">{payload[0].value}</span> đơn hàng
        </p>
        <p className="text-xs text-muted-foreground">{percent}% tổng số đơn</p>
      </div>
    );
  }
  return null;
};

export function OrderStatusPieChart({ data }: OrderStatusPieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  // Don't render if no data or empty data
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Phân bổ đơn hàng theo trạng thái</CardTitle>
          <CardDescription>
            Hiển thị tỷ lệ đơn hàng theo mỗi trạng thái
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">Không có dữ liệu</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate total orders for the label in the center
  const totalOrders = data.reduce((sum, entry) => sum + entry.count, 0);

  // Add totalCount to each item for percentage calculations in tooltip
  const dataWithTotal = data.map((item) => ({
    ...item,
    totalCount: totalOrders,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phân bổ đơn hàng theo trạng thái</CardTitle>
        <CardDescription>
          Tỷ lệ đơn hàng theo mỗi trạng thái trong kỳ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithTotal}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="count"
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
              >
                {dataWithTotal.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-card-foreground"
              >
                <tspan x="50%" dy="-0.5em" fontSize="14" fontWeight="500">
                  Tổng
                </tspan>
                <tspan x="50%" dy="1.5em" fontSize="16" fontWeight="600">
                  {totalOrders}
                </tspan>
              </text>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                formatter={(value, entry) => (
                  <span className="text-sm">{value}</span>
                )}
                className="fill-card-foreground"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
