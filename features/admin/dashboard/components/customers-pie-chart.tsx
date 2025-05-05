"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface CustomersPieChartProps {
  data: {
    registered: number;
    guest: number;
    registeredPercentage: number;
  };
}

export function CustomersPieChart({ data }: CustomersPieChartProps) {
  // Format the data for the pie chart
  const chartData = [
    { name: "Khách hàng đăng ký", value: data.registered, color: "#3B82F6" }, // Blue
    { name: "Khách vãng lai", value: data.guest, color: "#F59E0B" }, // Amber
  ];

  return (
    <Card className="col-span-1">
      <CardHeader className="pb-2">
        <CardTitle>Phân bổ loại khách hàng</CardTitle>
        <CardDescription>
          Tỉ lệ khách hàng đã đăng ký so với khách vãng lai
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={entry.color}
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  value.toLocaleString("vi-VN"),
                  "Số lượng",
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center text-sm mt-2 text-muted-foreground">
          <p>{data.registeredPercentage}% khách hàng đã đăng ký tài khoản</p>
        </div>
      </CardContent>
    </Card>
  );
}
