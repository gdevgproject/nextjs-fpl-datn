"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CustomerLocationDistribution {
  province: string;
  count: number;
}

interface CustomersLocationChartProps {
  data: CustomerLocationDistribution[];
}

export function CustomersLocationChart({ data }: CustomersLocationChartProps) {
  // Check if we have data to display
  if (!data || data.length === 0) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Phân bổ theo địa phương</CardTitle>
          <CardDescription>
            Top tỉnh/thành phố có nhiều đơn hàng nhất
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">Không có dữ liệu</p>
        </CardContent>
      </Card>
    );
  }

  // Format data for the chart (cap province names if too long)
  const formattedData = data.map((location) => ({
    province:
      location.province.length > 15
        ? `${location.province.substring(0, 15)}...`
        : location.province,
    fullName: location.province, // Keep full name for tooltip
    count: location.count,
  }));

  return (
    <Card className="col-span-1">
      <CardHeader className="pb-2">
        <CardTitle>Phân bổ theo địa phương</CardTitle>
        <CardDescription>
          Top tỉnh/thành phố có nhiều đơn hàng nhất
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 50,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="province"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis
                allowDecimals={false}
                tickFormatter={(value) => value.toLocaleString("vi-VN")}
              />
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  value.toLocaleString("vi-VN"),
                  "Đơn hàng",
                ]}
                labelFormatter={(label, props) => {
                  // Add safety check to prevent undefined error
                  if (
                    !props ||
                    !Array.isArray(props) ||
                    props.length === 0 ||
                    !props[0] ||
                    !props[0].payload
                  ) {
                    return label;
                  }
                  return props[0].payload.fullName;
                }}
              />
              <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
