"use client";

import { useState } from "react";
import { TopSellingProduct } from "../types";
import { formatPrice } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

interface TopSellingProductsListProps {
  byQuantity: TopSellingProduct[];
  byRevenue: TopSellingProduct[];
  timeFilterDescription: string;
}

export function TopSellingProductsList({
  byQuantity,
  byRevenue,
  timeFilterDescription,
}: TopSellingProductsListProps) {
  // State to track which tab is active
  const [activeTab, setActiveTab] = useState<"quantity" | "revenue">(
    "quantity"
  );

  // Check if data is empty
  const isEmpty = byQuantity.length === 0 && byRevenue.length === 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle>Top sản phẩm bán chạy</CardTitle>
        <CardDescription>
          Sản phẩm bán chạy nhất trong {timeFilterDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="quantity"
          onValueChange={(value) =>
            setActiveTab(value as "quantity" | "revenue")
          }
        >
          <TabsList className="mb-3">
            <TabsTrigger value="quantity">Số lượng</TabsTrigger>
            <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
          </TabsList>
          <TabsContent value="quantity" className="m-0">
            {isEmpty ? (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">Không có dữ liệu</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {byQuantity.map((product, idx) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 border rounded-md p-3"
                  >
                    <div className="font-semibold text-muted-foreground w-5">
                      {idx + 1}
                    </div>
                    <div className="relative w-10 h-10 rounded-md overflow-hidden border flex-shrink-0">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                          <span className="text-xs">N/A</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" title={product.name}>
                        {product.name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {product.brand}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {product.quantity.toLocaleString("vi-VN")}
                      </p>
                      <p className="text-sm text-muted-foreground">sản phẩm</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="revenue" className="m-0">
            {isEmpty ? (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">Không có dữ liệu</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {byRevenue.map((product, idx) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 border rounded-md p-3"
                  >
                    <div className="font-semibold text-muted-foreground w-5">
                      {idx + 1}
                    </div>
                    <div className="relative w-10 h-10 rounded-md overflow-hidden border flex-shrink-0">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                          <span className="text-xs">N/A</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" title={product.name}>
                        {product.name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {product.brand}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatPrice(product.revenue)}
                      </p>
                      <p className="text-sm text-muted-foreground">doanh thu</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
