"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface OrderItemsProps {
  orderId: string
}

export default function OrderItems({ orderId }: OrderItemsProps) {
  // Mẫu dữ liệu đơn hàng
  const order = {
    id: orderId,
    items: [
      {
        id: "ITEM-001",
        productId: "PROD-001",
        productName: "Dior Sauvage EDP",
        productSlug: "dior-sauvage-edp",
        variantName: "100ml",
        price: 2500000,
        quantity: 1,
        subtotal: 2500000,
        imageUrl: "/placeholder.svg?height=80&width=80",
      },
      {
        id: "ITEM-002",
        productId: "PROD-002",
        productName: "Chanel Bleu de Chanel EDP",
        productSlug: "chanel-bleu-de-chanel-edp",
        variantName: "50ml",
        price: 1800000,
        quantity: 1,
        subtotal: 1800000,
        imageUrl: "/placeholder.svg?height=80&width=80",
      },
    ],
    subtotal: 4300000,
    discount: 2150000,
    shippingFee: 0,
    total: 2150000,
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sản phẩm trong đơn hàng</CardTitle>
        <CardDescription>Danh sách sản phẩm trong đơn hàng #{orderId}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Hình ảnh</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Số lượng</TableHead>
              <TableHead className="text-right">Thành tiền</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Image
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={item.productName}
                    width={80}
                    height={80}
                    className="rounded-md object-cover"
                  />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Link
                      href={`/admin/san-pham/${item.productSlug}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {item.productName}
                    </Link>
                    <p className="text-sm text-muted-foreground">Phiên bản: {item.variantName}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(item.price)}
                </TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell className="text-right font-medium">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(item.subtotal)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-6 space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Tạm tính:</span>
            <span>
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(order.subtotal)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Giảm giá:</span>
            <span>
              -
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(order.discount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Phí vận chuyển:</span>
            <span>
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(order.shippingFee)}
            </span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-lg font-bold">Tổng cộng:</span>
            <span className="text-lg font-bold">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(order.total)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

