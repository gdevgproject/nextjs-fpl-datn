"use client"

import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { ExternalLink, Package, Truck, DollarSign, Calendar } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InventoryHistory } from "@/components/admin/san-pham/inventory-history"

interface InventoryDetailProps {
  item: any
}

export function InventoryDetail({ item }: InventoryDetailProps) {
  if (!item) return null

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMMM yyyy, HH:mm", { locale: vi })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_stock":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Còn hàng
          </Badge>
        )
      case "low_stock":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Sắp hết hàng
          </Badge>
        )
      case "out_of_stock":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Hết hàng
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Tabs defaultValue="info">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="info">Thông tin sản phẩm</TabsTrigger>
        <TabsTrigger value="history">Lịch sử tồn kho</TabsTrigger>
      </TabsList>

      <TabsContent value="info" className="space-y-4 py-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <div className="rounded-lg border overflow-hidden">
              <Image
                src={item.main_image || "/placeholder.svg"}
                alt={item.product_name}
                width={300}
                height={300}
                className="w-full object-cover aspect-square"
              />
            </div>
          </div>

          <div className="md:w-2/3 space-y-4">
            <div>
              <h2 className="text-2xl font-bold">{item.product_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{item.brand_name}</Badge>
                {getStatusBadge(item.status)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Mã sản phẩm</p>
                <p className="font-medium">{item.product_code}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">SKU</p>
                <p className="font-medium">{item.sku}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Dung tích</p>
                <p className="font-medium">{item.volume_ml} ml</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tồn kho</p>
                <p className="font-medium">{item.stock_quantity}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Giá bán</p>
                <p className="font-medium text-green-600">{formatPrice(item.price)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Cập nhật lần cuối</p>
                <p className="font-medium">{formatDate(item.last_updated)}</p>
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/san-pham/${item.product_id}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Xem sản phẩm
                </Link>
              </Button>
              <Button variant="outline" size="sm">
                <Package className="h-4 w-4 mr-2" />
                Nhập hàng
              </Button>
              <Button variant="outline" size="sm">
                <Truck className="h-4 w-4 mr-2" />
                Đặt hàng từ nhà cung cấp
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Package className="h-4 w-4 mr-2 text-primary" />
                Tồn kho
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.stock_quantity}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {item.stock_quantity === 0 ? "Đã hết hàng" : item.stock_quantity <= 5 ? "Sắp hết hàng" : "Còn hàng"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-primary" />
                Giá trị tồn kho
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatPrice(item.price * item.stock_quantity)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {item.stock_quantity} x {formatPrice(item.price)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-primary" />
                Cập nhật lần cuối
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium">{formatDate(item.last_updated)}</div>
              <p className="text-xs text-muted-foreground mt-1">Bởi Nguyễn Văn Admin</p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="history">
        <div className="py-4">
          <InventoryHistory variantId={item.variant_id} />
        </div>
      </TabsContent>
    </Tabs>
  )
}

