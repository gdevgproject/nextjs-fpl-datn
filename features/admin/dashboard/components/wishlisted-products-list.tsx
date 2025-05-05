"use client";

import { WishlistedProduct } from "../types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WishlistedProductsListProps {
  products: WishlistedProduct[];
}

export function WishlistedProductsList({
  products,
}: WishlistedProductsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sản phẩm được yêu thích nhiều nhất</CardTitle>
        <CardDescription>
          Sản phẩm xuất hiện nhiều nhất trong danh sách yêu thích của người dùng
        </CardDescription>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="flex items-center justify-center h-[100px]">
            <p className="text-muted-foreground">Không có dữ liệu</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="border rounded-lg p-4 flex flex-col"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium truncate" title={product.name}>
                    {product.name}
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      product.inStock
                        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
                        : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"
                    }
                  >
                    {product.inStock ? "Còn hàng" : "Hết hàng"}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-3">
                  {product.brand}
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="text-sm">Lượt yêu thích:</div>
                  <div className="text-sm font-medium">
                    {product.count.toLocaleString("vi-VN")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
