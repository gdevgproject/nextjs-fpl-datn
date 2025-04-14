"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

interface OrderItemsProps {
  items: any[]
}

export function OrderItems({ items }: OrderItemsProps) {
  if (!items || items.length === 0) {
    return <p className="text-muted-foreground">Không có sản phẩm nào</p>
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sản phẩm</TableHead>
            <TableHead className="text-right">Đơn giá</TableHead>
            <TableHead className="text-right">Số lượng</TableHead>
            <TableHead className="text-right">Thành tiền</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="font-medium">
                  {item.product_name}
                  {item.product_variants?.products?.slug && (
                    <Button variant="link" size="icon" className="h-4 w-4 p-0 ml-1" asChild>
                      <Link href={`/${item.product_variants.products.slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                        <span className="sr-only">View product</span>
                      </Link>
                    </Button>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.variant_volume_ml}ml
                  {item.product_variants?.sku && ` - SKU: ${item.product_variants.sku}`}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(item.unit_price_at_order)}
              </TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-right">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(item.unit_price_at_order * item.quantity)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
