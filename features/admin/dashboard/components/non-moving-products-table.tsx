"use client";

import { NonMovingProduct } from "../types";
import { formatDate } from "@/lib/utils";
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

interface NonMovingProductsTableProps {
  products: NonMovingProduct[];
}

export function NonMovingProductsTable({
  products,
}: NonMovingProductsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sản phẩm tồn kho lâu</CardTitle>
        <CardDescription>
          Sản phẩm có tồn kho cao nhưng không bán được trong 30 ngày qua
        </CardDescription>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-muted-foreground">
              Không có sản phẩm tồn kho lâu
            </p>
          </div>
        ) : (
          <div className="relative overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Biến thể</TableHead>
                  <TableHead className="text-right">Tồn kho</TableHead>
                  <TableHead className="text-right">Ngày bán cuối</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.variant}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="bg-muted/50">
                        {product.stockQuantity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {product.lastOrderDate ? (
                        <span className="text-sm text-muted-foreground">
                          {formatDate(product.lastOrderDate)}
                          <span className="ml-1 text-xs">
                            (cách đây {product.daysSinceLastOrder} ngày)
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Chưa từng bán
                        </span>
                      )}
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
