"use client";

import { LowStockProduct } from "../types";
import { formatPrice } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface LowStockTableProps {
  products: LowStockProduct[];
}

export function LowStockTable({ products }: LowStockTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sản phẩm sắp hết hàng</CardTitle>
        <CardDescription>
          Các sản phẩm có số lượng tồn kho dưới ngưỡng cảnh báo
        </CardDescription>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-muted-foreground">
              Không có sản phẩm sắp hết hàng
            </p>
          </div>
        ) : (
          <div className="relative overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Biến thể</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Tồn kho</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.variant}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          product.stockQuantity < 5 ? "destructive" : "outline"
                        }
                        className={
                          product.stockQuantity < 5
                            ? ""
                            : "text-yellow-600 border-yellow-400 bg-yellow-50 dark:text-yellow-400 dark:border-yellow-500 dark:bg-yellow-950/50"
                        }
                      >
                        {product.stockQuantity}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
