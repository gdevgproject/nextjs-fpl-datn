"use client";

import { BrandRevenue } from "../types";
import { formatPrice } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { useTheme } from "next-themes";

interface BrandRevenueChartProps {
  data: BrandRevenue[];
}

export function BrandRevenueChart({ data }: BrandRevenueChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Cải thiện màu sắc để phù hợp với cả dark và light mode
  const brandColorsAdaptive: Record<string, { light: string; dark: string }> = {
    Chanel: { light: "#1F1F1F", dark: "#E0E0E0" }, // Đen cho light mode, xám sáng cho dark mode
    Dior: { light: "#E0BFB8", dark: "#F5D0C5" }, // Hồng nhạt
    Gucci: { light: "#006F51", dark: "#00BF8F" }, // Xanh lá
    Versace: { light: "#B8860B", dark: "#FFD700" }, // Vàng
    Burberry: { light: "#A67B5B", dark: "#D4A76A" }, // Tan
    "Dolce & Gabbana": { light: "#9B0000", dark: "#FF4040" }, // Đỏ
    Hermès: { light: "#FF8000", dark: "#FFA54F" }, // Cam
    Prada: { light: "#000080", dark: "#4169E1" }, // Xanh navy
    "Tom Ford": { light: "#4B0082", dark: "#9370DB" }, // Tím đậm
    "Yves Saint Laurent": { light: "#333333", dark: "#C0C0C0" }, // Đen/Xám
    "Jo Malone": { light: "#D2B48C", dark: "#F5DEB3" }, // Be
    Creed: { light: "#808080", dark: "#C0C0C0" }, // Bạc
    "Acqua di Parma": { light: "#DAA520", dark: "#FFD700" }, // Vàng
    Byredo: { light: "#4B0082", dark: "#9370DB" }, // Màu tím thay cho màu trắng
    Diptyque: { light: "#2F4F4F", dark: "#8FBC8F" }, // Xanh rêu
    "Le Labo": { light: "#8B4513", dark: "#CD853F" }, // Nâu
    "Maison Francis Kurkdjian": { light: "#CD853F", dark: "#FFDEAD" }, // Vàng nâu
    "Frederic Malle": { light: "#800000", dark: "#DC143C" }, // Đỏ đô
    Kilian: { light: "#222222", dark: "#BBBBBB" }, // Đen/Xám
  };

  // Bảng màu mặc định được thiết kế phù hợp với cả dark và light mode
  const defaultColorsDark = [
    "#60A5FA", // Blue
    "#818CF8", // Indigo
    "#A5B4FC", // Violet
    "#C4B5FD", // Purple
    "#F472B6", // Pink
    "#FB7185", // Rose
    "#F87171", // Red
    "#FBBF24", // Amber
    "#A3E635", // Lime
    "#34D399", // Emerald
    "#22D3EE", // Cyan
    "#7DD3FC", // Sky
  ];

  const defaultColorsLight = [
    "#2563EB", // Blue
    "#4F46E5", // Indigo
    "#6D28D9", // Violet
    "#9333EA", // Purple
    "#DB2777", // Pink
    "#E11D48", // Rose
    "#DC2626", // Red
    "#D97706", // Amber
    "#65A30D", // Lime
    "#059669", // Emerald
    "#0891B2", // Cyan
    "#0284C7", // Sky
  ];

  const defaultColors = isDark ? defaultColorsDark : defaultColorsLight;

  // Sort data by revenue in descending order and take top 10
  const sortedData = [...data]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Add percentage calculation and apply adaptive colors
  const totalRevenue = sortedData.reduce((sum, item) => sum + item.revenue, 0);
  let colorIndex = 0;

  const dataWithPercentage = sortedData.map((item) => {
    // Lấy màu thích ứng với theme hiện tại
    let color;
    if (item.name in brandColorsAdaptive) {
      color = isDark
        ? brandColorsAdaptive[item.name].dark
        : brandColorsAdaptive[item.name].light;
    } else {
      color = defaultColors[colorIndex % defaultColors.length];
      colorIndex++;
    }

    return {
      ...item,
      displayColor: color, // Màu hiển thị thích ứng với theme
      percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0,
    };
  });

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 border rounded-md shadow-md">
          <p className="font-medium text-card-foreground">{payload[0].name}</p>
          <p className="text-sm font-semibold text-card-foreground">
            {formatPrice(payload[0].value)}
          </p>
          <p className="text-xs text-muted-foreground">
            {payload[0].payload.percentage.toFixed(1)}% tổng doanh thu
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Doanh thu theo thương hiệu</CardTitle>
        <CardDescription>Phân bổ doanh thu theo thương hiệu</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">Không có dữ liệu</p>
          </div>
        ) : (
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dataWithPercentage}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  left: 50,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                  className="stroke-muted"
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatPrice(value)}
                  className="fill-foreground"
                  domain={[0, "dataMax"]}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  width={100}
                  className="fill-foreground"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Doanh thu" radius={[0, 4, 4, 0]}>
                  {dataWithPercentage.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.displayColor} // Sử dụng màu đã thích ứng với theme
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                  <LabelList
                    dataKey="percentage"
                    position="right"
                    formatter={(value: number) => `${value.toFixed(1)}%`}
                    className="fill-foreground text-[11px]"
                    style={{ fontSize: "11px" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
