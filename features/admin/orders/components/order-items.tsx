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
        {items.map((item) => {
          // Safely access nested properties
          const productVariant = item.product_variants || {};
          const product = productVariant.products || {};
          const productImages = product.product_images || [];

          // Tìm hình ảnh chính (is_main = true) hoặc lấy hình đầu tiên nếu không có hình chính
          const mainImage =
            productImages.find((img) => img.is_main) || productImages[0];
          const brandName = product.brands?.name;

          // Sử dụng thông tin snapshot tại thời điểm đặt hàng
          const productName =
            item.product_name || product.name || "Sản phẩm không xác định";
          const volume =
            item.variant_volume_ml || productVariant.volume_ml || "N/A";
          const unitPrice = item.unit_price_at_order;
          const totalPrice = unitPrice * item.quantity;

          // Sử dụng slug từ thông tin hiện tại nếu có, để tạo link đến sản phẩm
          const productLink = product.slug
            ? `/san-pham/${product.slug}`
            : product.id
            ? `/admin/products/${product.id}`
            : null;

          return (
            <TableRow key={item.id}>
              <TableCell>
                {mainImage ? (
                  <Image
                    src={mainImage.image_url || "/images/placeholder.jpg"}
                    alt={productName}
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
                  {productLink ? (
                    <Link href={productLink} className="hover:underline">
                      {productName}
                    </Link>
                  ) : (
                    <span>{productName}</span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{volume} ml</div>
                {brandName && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {brandName}
                  </div>
                )}
                {productVariant.sku && (
                  <div className="text-xs text-muted-foreground mt-1">
                    SKU: {productVariant.sku}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-center">
                {formatCurrency(unitPrice)}
              </TableCell>
              <TableCell className="text-center">{item.quantity}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(totalPrice)}
              </TableCell>
            </TableRow>
          );
        })}
        <TableRow>
          <TableCell colSpan={4} className="text-right font-medium">
            Tạm tính
          </TableCell>
          <TableCell className="text-right font-bold">
            {formatCurrency(
              items.reduce(
                (sum, item) => sum + item.unit_price_at_order * item.quantity,
                0
              )
            )}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
