"use client";

import Image from "next/image";
import Link from "next/link";
import { useOrderItems } from "../hooks/use-order-items";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/format";
import { OrderItemWithProduct } from "../types";

interface OrderItemsProps {
  orderId: number;
}

export function OrderItems({ orderId }: OrderItemsProps) {
  const { data, isLoading, isError } = useOrderItems(orderId);
  const items = data?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-4 text-destructive">
        Có lỗi xảy ra khi tải thông tin sản phẩm
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Không có sản phẩm nào trong đơn hàng này
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>Danh sách sản phẩm trong đơn hàng</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Ảnh</TableHead>
          <TableHead>Sản phẩm</TableHead>
          <TableHead className="text-center">Giá đơn vị</TableHead>
          <TableHead className="text-center">Số lượng</TableHead>
          <TableHead className="text-right">Thành tiền</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              {item.product_variants?.products?.product_images?.some(
                (img) => img.is_main
              ) ? (
                <Image
                  src={
                    item.product_variants.products.product_images.find(
                      (img) => img.is_main
                    )?.image_url || "/placeholder.jpg"
                  }
                  alt={item.product_variants.products.name}
                  width={80}
                  height={80}
                  className="rounded-md object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center text-muted-foreground text-xs">
                  No image
                </div>
              )}
            </TableCell>
            <TableCell>
              <div className="font-medium">
                <Link
                  href={`/admin/products/${item.product_variants.products.id}`}
                  className="hover:underline"
                >
                  {item.product_variants.products.name}
                </Link>
              </div>
              <div className="text-sm text-muted-foreground">
                {item.product_variants.volume} ml
              </div>
              {item.product_variants.products.brands && (
                <div className="text-xs text-muted-foreground mt-1">
                  {item.product_variants.products.brands.name}
                </div>
              )}
            </TableCell>
            <TableCell className="text-center">
              {formatCurrency(item.unit_price)}
            </TableCell>
            <TableCell className="text-center">{item.quantity}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(item.unit_price * item.quantity)}
            </TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell colSpan={4} className="text-right font-medium">
            Tổng cộng
          </TableCell>
          <TableCell className="text-right font-bold">
            {formatCurrency(
              items.reduce(
                (sum, item) => sum + item.unit_price * item.quantity,
                0
              )
            )}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
